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
const DEFAULT_COMMIT_NUMBER = 0
const MINOR = 'minor'
const PATCH = 'patch'
const RECENT_TAG_INDEX = 0

interface ReleaseInformation {
  releaseType: ReleaseType
  commitNumber: number
}

export const buildVersions = (currentVersion: string, releaseInformation: ReleaseInformation): Versions => {
  logger.verbose('[versions-service][buildVersions]', 'Enter function')
  logger.silly('[versions-service][buildVersions] - input', 'currentVersion: %s', currentVersion)
  logger.silly('[versions-service][buildVersions] - input', 'releaseType: %s', releaseInformation.releaseType)
  logger.silly('[versions-service][buildVersions] - input', 'commitNumber: %s', releaseInformation.commitNumber)

  if (!currentVersion) {
    currentVersion = DEFAULT_CURRENT_VERSION
  }
  const commitNumber = releaseInformation.commitNumber
  const nextRelease = commitNumber > 0 ? inc(currentVersion, releaseInformation.releaseType) || DEFAULT_NEXT_VERSION : currentVersion
  const nextMinor = inc(currentVersion, MINOR) || DEFAULT_NEXT_MINOR
  const nextPatch = inc(currentVersion, PATCH) || DEFAULT_NEXT_PATCH
  const nextCommitTag = nextRelease

  return {
    currentVersion,
    nextRelease,
    nextMinor,
    nextPatch,
    nextCommitTag,
    commitNumber,
  }
}

export function cleanVersion(version: string, tagPrefix = ''): string {
  logger.verbose('[versions-service][cleanVersion]', 'Enter function')
  logger.silly('[versions-service][cleanVersion] - input', 'version: %s', version)
  logger.silly('[versions-service][cleanVersion] - input', 'tagPrefix: %s', tagPrefix)
  const cleanVersion = clean(version.replace(tagPrefix, ''), { loose: true })

  if (!cleanVersion) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Version ${cleanVersion} is not valid`)
  } else {
    return cleanVersion
  }
}

export const getReleaseInformation = (data: GetVersionData): Promise<ReleaseInformation> => {
  logger.verbose('[versions-service][getReleaseType]', 'Enter function')
  logger.silly('[versions-service][getReleaseType] - input', 'data: %j', data)

  let commitNumber = DEFAULT_COMMIT_NUMBER

  const options: BumpOptions = {
    tagPrefix: data.tagPrefix,
    preset: data.preset,
    whatBump: commits => {
      const filteredCommits = commits.filter(commit => !!commit.type)

      const PATCH_LEVEL = 0
      const MINOR_LEVEL = 1
      const MAJOR_LEVEL = 2
      let level = MAJOR_LEVEL

      filteredCommits.forEach(commit => {
        const MERGE_TYPE = 'merge'
        const FEATURE_TYPE = 'feat'
        const { type, notes } = commit

        logger.silly('[versions-service][getReleaseType] - commit', 'type: "%s", notes: "%j"', type, notes)
        let commitLevel = MAJOR_LEVEL

        if (notes && notes.length > 0) {
          commitLevel = PATCH_LEVEL
        } else if (FEATURE_TYPE === commit.type) {
          commitLevel = MINOR_LEVEL
        }

        if (MERGE_TYPE !== commit.type) {
          ++commitNumber
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

  return new Promise<ReleaseInformation>((resolve, reject) => {
    conventionalRecommendedBump(
      options,
      {
        headerPattern: buildPattern(data),
      },
      (error, recommendation: BumpRecommendation) => {
        if (error) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          logger.error('[versions-service][getReleaseType]', error)
          reject(error)
        } else {
          logger.silly('[versions-service][getReleaseType] - output', 'recommendation: %j', recommendation)
          resolve({ releaseType: recommendation.releaseType || 'patch', commitNumber })
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

  const releaseInformation = await getReleaseInformation(data)
  const currentVersion = await getCurrentVersion(data)
  const versions = buildVersions(currentVersion, releaseInformation)

  return str(
    JSON.stringify({
      ...versions,
      nextCommitTag: data.tagPrefix + versions.nextCommitTag,
    }),
  )
}
