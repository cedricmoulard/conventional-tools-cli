import * as conventionalChangelog from 'conventional-changelog'
import { GetChangelogData } from '../commands/get-changelog-command'
import { buildVersions, getCurrentVersion, getReleaseInformation } from './versions-services'
import * as logger from 'npmlog'
import { buildPattern } from './utils'
import { Context, GeneratedContext, Options } from 'conventional-changelog-writer'
import { Commit } from 'conventional-commits-parser'
import { merge } from 'lodash'
import * as path from 'path'

export const RELEASE_COUNT_FOR_EXISTING_TAG = 2
export const RELEASE_COUNT_FOR_CREATE_TAG = 1

const finalize = (host: string, version: string): Options.FinalizeContext<Context, Commit> => {
  return (context: GeneratedContext<Commit, Context>): GeneratedContext => {
    logger.verbose('[changelog-service][finalize]', 'Finalize context')
    logger.silly('[changelog-service][finalize] - input', 'context: %o', context)

    let noteGroups = context.noteGroups.filter(noteGroup => {
      // @ts-ignore
      return noteGroup['notes'].some(note => !!note.commit.type)
    })

    noteGroups = noteGroups.map(noteGroup => {
      // @ts-ignore
      const notes = noteGroup['notes'].filter(note => {
        return !!note.commit.type
      })

      return {
        ...noteGroup,
        notes,
      }
    })

    const newContext = {
      ...context,
      version,
      host,
      commitGroups: context.commitGroups.filter(commitGroup => !!commitGroup.title),
      noteGroups,
    } as GeneratedContext

    logger.silly('[changelog-service][finalize] - output', 'context: %o', newContext)

    return newContext
  }
}

export const getChangelog = async (data: GetChangelogData): Promise<NodeJS.ReadableStream> => {
  logger.verbose('[changelog-service][getChangelog]', 'Enter function')

  const releaseInformation = await getReleaseInformation(data)
  const currentVersion = await getCurrentVersion(data)
  const versions = buildVersions(currentVersion, releaseInformation, data)

  const { tagExists, tagPrefix, host, preset, config } = data

  const options: conventionalChangelog.Options = {
    tagPrefix,
    preset,
    releaseCount: tagExists ? RELEASE_COUNT_FOR_EXISTING_TAG : RELEASE_COUNT_FOR_CREATE_TAG,
  }

  if (config) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configContent = require(path.join(process.cwd(), config))
    options.config = configContent.options = merge(options, configContent.options)
  }

  logger.verbose('[changelog-service][getChangelog]', 'conventional changelog log options: %o', options)

  return conventionalChangelog(
    options,
    undefined,
    {
      debug: message => logger.silly('[changelog-service][gitRawCommitsOpts]', 'message: %s', message),
    },
    {
      warn: message => logger.silly('[changelog-service][parserOpts]', 'warn message: %s', message),
      headerPattern: buildPattern(data),
    },
    {
      debug: message => logger.silly('[changelog-service][writerOps]', 'message: %s', message),
      finalizeContext: finalize(host, versions.nextCommitTag),
    },
  )
}
