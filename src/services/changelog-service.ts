import * as conventionalChangelog from 'conventional-changelog'
import { GetChangelogData } from '../commands/get-changelog-command'
import { buildVersions, getCurrentVersion, getReleaseType } from './versions-services'
import * as logger from 'npmlog'
import { buildPattern } from './utils'
import { Context, GeneratedContext, Options } from 'conventional-changelog-writer'
import { Commit } from 'conventional-commits-parser'

export const RELEASE_COUNT_FOR_EXISTING_TAG = 2
export const RELEASE_COUNT_FOR_CREATE_TAG = 1

const finalize = (host: string, version: string): Options.FinalizeContext<Context, Commit> => {
  return (context: GeneratedContext<Commit, Context>): GeneratedContext => {
    logger.verbose('[utils][finalize]', 'Finalize context')
    logger.silly('[utils][finalize] - input', 'context: %o', context)

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

    logger.silly('[utils][finalize] - output', 'context: %o', newContext)

    return newContext
  }
}

export const getChangelog = async (data: GetChangelogData): Promise<NodeJS.ReadableStream> => {
  logger.verbose('[changelog-service][getChangelog]', 'Enter function')

  const releaseType = await getReleaseType(data)
  const currentVersion = await getCurrentVersion(data)
  const versions = buildVersions(currentVersion, releaseType)

  const { tagExists, tagPrefix, host, preset } = data
  const options: conventionalChangelog.Options = {
    tagPrefix,
    preset,
    releaseCount: tagExists ? RELEASE_COUNT_FOR_EXISTING_TAG : RELEASE_COUNT_FOR_CREATE_TAG,
  }

  logger.verbose('[changelog-service][getChangelog]', 'conventional changelog log options: %o', options)

  return conventionalChangelog(
    options,
    undefined,
    undefined,
    {
      headerPattern: buildPattern(data),
    },
    {
      finalizeContext: finalize(host, data.tagExists ? versions.currentVersion : versions.nextVersion),
    },
  )
}
