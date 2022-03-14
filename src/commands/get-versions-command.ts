import { CustomCommand } from './custom-command'
import { CommandData } from '../models/command-data'
import { Option } from '../models/option'
import { getVersions } from '../services/versions-services'
import * as logger from 'npmlog'
import * as fs from 'fs'
import * as Stream from 'stream'

export interface GetVersionData extends CommandData {
  readonly tagPrefix: string
  readonly outputFile?: string
}

const options: Option[] = [
  {
    flags: '-o, --output-file <file>',
    description: 'write the versions to this file',
    required: false,
  },
]

export class GetVersionsCommand extends CustomCommand<GetVersionData> {
  constructor() {
    super('get-versions', 'Get all versions according to conventional commits convention', options)
  }

  protected async run(data: GetVersionData): Promise<void> {
    const stream = await getVersions(data)
    let outStream: Stream.Writable = process.stdout
    if (data.outputFile) {
      logger.silly('changelog-command', 'In')
      outStream = fs.createWriteStream(data.outputFile)
    }
    stream.pipe(outStream)
  }
}
