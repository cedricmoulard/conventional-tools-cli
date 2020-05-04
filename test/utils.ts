import * as path from "path"
import { v4 } from 'uuid'
import * as fs from 'fs-extra'
import * as process from 'process'
import * as unzip from 'extract-zip'

export const prepareRepository = async (tempPath: string, file: string): Promise<string> => {
  const repositoryPath  = path.resolve(tempPath, v4())
  const dataPath = path.resolve(__dirname, 'repositories', file)
  fs.ensureDirSync(repositoryPath)
  await unzip(dataPath, { dir: repositoryPath })
  jest.spyOn(process, 'cwd').mockReturnValue(repositoryPath)
  return repositoryPath
}

export const getResultFromStream = (stream: NodeJS.ReadableStream): Promise<string> => {

  return new Promise<string>(resolve => {
    let actual = ''
    stream.on('data', (data) => {
      actual += data
    })

    stream.on('end', () => {
      resolve(actual)
    })

  })


}
