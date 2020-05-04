import * as path from 'path'
import * as fs from 'fs-extra'
import { getResultFromStream, prepareRepository } from '../utils'
import { getChangelog } from '../../src/services/changelog-service'
import { GetChangelogData } from '../../src/commands/get-changelog-command'

describe('Changelog Service', () => {
  const tempPath = path.resolve(__dirname, '..', 'temp', 'changelog')

  const globalData: GetChangelogData = {
    preset: 'conventionalcommits',
    tagPrefix: '',
    debug: 'silly',
    scopes: '*',
    host: '',
    tagExists: false,
  }

  beforeAll(() => {
    jest.useFakeTimers()
  })

  beforeEach(() => {
    const currentDate = new Date('2019-05-14T11:01:58.135Z')
    // @ts-ignore
    jest.spyOn(global, 'Date').mockImplementation(() => currentDate)
  })

  afterAll(() => {
    fs.removeSync(tempPath)
  })

  describe('given step 1', () => {
    beforeEach(async () => {
      await prepareRepository(tempPath, 'step-1.zip')
    })

    test('generates changelog for module 2', async () => {
      // Given
      const data: GetChangelogData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2|shared',
      }

      // When
      const stream = await getChangelog(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })
  })

  describe('given step 2', () => {
    beforeEach(async () => {
      await prepareRepository(tempPath, 'step-2.zip')
    })

    test('generates changelog for patch module 2', async () => {
      // Given
      const data: GetChangelogData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2|shared',
      }

      // When
      const stream = await getChangelog(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })
  })

  describe('given step 3', () => {
    beforeEach(async () => {
      await prepareRepository(tempPath, 'step-3.zip')
    })

    test('generates changelog with breaking change for module 2', async () => {
      // Given
      const data: GetChangelogData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2|shared',
      }

      // When
      const stream = await getChangelog(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })

    test('generates changelog without breaking change for module 2', async () => {
      // Given
      const data: GetChangelogData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2',
      }

      // When
      const stream = await getChangelog(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })

    test('generates changelog with breaking change for module 1 (existing tag)', async () => {
      // Given
      const data: GetChangelogData = {
        ...globalData,
        tagExists: true,
        tagPrefix: 'module1@',
        scopes: 'module1|shared',
      }

      // When
      const stream = await getChangelog(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })
  })
})
