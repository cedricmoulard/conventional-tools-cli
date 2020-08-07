import * as path from 'path'
import * as fs from 'fs-extra'
import { getResultFromStream, prepareRepository } from '../utils'
import { getVersions } from '../../src/services/versions-services'
import { GetVersionData } from '../../src/commands/get-versions-command'

describe('Versions Service', () => {
  const tempPath = path.resolve(__dirname, '..', 'temp', 'versions')

  const globalData: GetVersionData = {
    preset: 'conventionalcommits',
    tagPrefix: '',
    debug: 'silent',
    scopes: '*',
  }

  afterAll(() => {
    fs.removeSync(tempPath)
  })

  describe('given step 1', () => {
    beforeEach(async () => {
      await prepareRepository(tempPath, 'step-1.zip')
    })

    test('returns minor version for module 2', async () => {
      // Given
      const data: GetVersionData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2|shared',
      }

      // When
      const stream = await getVersions(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })
  })

  describe('given step 2', () => {
    beforeEach(async () => {
      await prepareRepository(tempPath, 'step-2.zip')
    })

    test('returns patch version for module 2', async () => {
      // Given
      const data: GetVersionData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2|shared',
      }

      // When
      const stream = await getVersions(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })
  })

  describe('given step 3', () => {
    beforeEach(async () => {
      await prepareRepository(tempPath, 'step-3.zip')
    })

    test('returns no new version for module 2', async () => {
      // Given
      const data: GetVersionData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2',
      }

      // When
      const stream = await getVersions(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })

    test('returns major version for module 2', async () => {
      // Given
      const data: GetVersionData = {
        ...globalData,
        tagPrefix: 'module2@',
        scopes: 'module2|shared',
      }

      // When
      const stream = await getVersions(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })

    test('returns no new version for module 1', async () => {
      // Given
      const data: GetVersionData = {
        ...globalData,
        tagPrefix: 'module1@',
        scopes: 'module1|shared',
      }

      // When
      const stream = await getVersions(data)
      const actual = await getResultFromStream(stream)
      // Then
      expect(actual).toMatchSnapshot()
    })
  })
})
