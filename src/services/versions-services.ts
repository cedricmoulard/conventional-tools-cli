import { Versions } from '../models/versions'
import * as conventionalRecommendedBump from 'conventional-recommended-bump'
import * as gitSemverTags from 'git-semver-tags'
import { clean, inc, ReleaseType } from 'semver'
import { GetVersionData } from '../commands/get-versions-command'
import * as logger from 'npmlog'
import { buildPattern } from './utils'
import BumpOptions = conventionalRecommendedBump.Options
import BumpRecommendation = conventionalRecommendedBump.Callback.Recommendation
import * as str from 'string-to-stream'

const DEFAULT_CURRENT_VERSION = '0.0.0'
const DEFAULT_NEXT_VERSION = '0.1.0'
const DEFAULT_NEXT_MINOR = '0.2.0'
const DEFAULT_NEXT_PATCH = '0.0.1'
const MINOR = 'minor'
const PATCH = 'patch'
const RECENT_TAG_INDEX = 0

export const buildVersions = (currentVersion: string, releaseType: ReleaseType): Versions => {
  logger.verbose('[versions-service][buildVersions]', 'Enter function')
  logger.silly('[versions-service][buildVersions] - input', 'currentVersion: %s', currentVersion)
  logger.silly('[versions-service][buildVersions] - input', 'releaseType: %s', releaseType)

  if (!currentVersion) {
    currentVersion = DEFAULT_CURRENT_VERSION
  }
  const nextVersion = inc(currentVersion, releaseType) || DEFAULT_NEXT_VERSION
  const nextMinor = inc(nextVersion, MINOR) || DEFAULT_NEXT_MINOR
  const nextPatch = inc(currentVersion, PATCH) || DEFAULT_NEXT_PATCH

  return {
    currentVersion,
    nextRelease: nextVersion,
    nextMinor,
    nextPatch,
  }
}

export function cleanVersion(version: string, tagPrefix = ''): string {
  logger.verbose('[versions-service][cleanVersion]', 'Enter function')
  logger.silly('[versions-service][cleanVersion] - input', 'version: %s', version)
  logger.silly('[versions-service][cleanVersion] - input', 'tagPrefix: %s', tagPrefix)
  const cleanVersion = clean(version.replace(tagPrefix, ''), { loose: true })

  if (!cleanVersion) {
    throw new Error(`Version ${cleanVersion} is not valid`)
  } else {
    return cleanVersion
  }
}

export const getReleaseType = (data: GetVersionData): Promise<BumpRecommendation.ReleaseType> => {
  logger.verbose('[versions-service][getReleaseType]', 'Enter function')
  logger.silly('[versions-service][getReleaseType] - input', 'data: %j', data)
  const options: BumpOptions = {
    tagPrefix: data.tagPrefix,
    preset: data.preset,
    whatBump: commits => {
      const filteredCommits = commits.filter(commit => !!commit.type)

      let level = 2

      filteredCommits.forEach(commit => {
        const { type, notes } = commit

        logger.silly('[versions-service][getReleaseType] - commit', 'type: "%s", notes: "%j"', type, notes)
        let commitLevel = 2
        if (notes && notes.length > 0) {
          commitLevel = 0
        } else if (commit.type === 'feat') {
          commitLevel = 1
        }

        if (commitLevel < level) {
          level = commitLevel
        }
      })

      return {
        level,
      }
    },
  }

  return new Promise<BumpRecommendation.ReleaseType>((resolve, reject) => {
    conventionalRecommendedBump(
      options,
      {
        headerPattern: buildPattern(data),
      },
      (error, recommendation: BumpRecommendation) => {
        if (error) {
          logger.error('[versions-service][getReleaseType]', error)
          reject(error)
        } else {
          logger.silly('[versions-service][getReleaseType] - output', 'recommendation: %j', recommendation)
          resolve(recommendation.releaseType)
        }
      },
    )
  })
}

export const getCurrentVersion = (configuration: gitSemverTags.Options): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    gitSemverTags(configuration, function (error, tags) {
      if (error) {
        reject(error)
      } else {
        let currentVersion = DEFAULT_CURRENT_VERSION
        if (!!tags && tags.length > 0) {
          currentVersion = cleanVersion(tags[RECENT_TAG_INDEX], configuration.tagPrefix)
        }
        resolve(currentVersion)
      }
    })
  })
}

export const getVersions = async (data: GetVersionData): Promise<NodeJS.ReadableStream> => {
  logger.verbose('[versions-service][getVersions]', 'Enter function')

  const releaseType = await getReleaseType(data)
  const currentVersion = await getCurrentVersion(data)
  const versions = buildVersions(currentVersion, releaseType)

  return str(JSON.stringify(versions))
}
