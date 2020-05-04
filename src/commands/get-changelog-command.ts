import * as fs from 'fs'
import * as Stream from 'stream'
import * as logger from 'npmlog'
import { CommandData } from '../models/command-data'
import { CustomCommand } from './custom-command'
import { Option } from '../models/option'
import { getChangelog } from '../services/changelog-service'

export interface GetChangelogData extends CommandData {
  readonly host: string
  readonly tagExists: boolean
  readonly outputFile?: string
}

const options: Option[] = [
  {
    flags: '--host <host>',
    description: 'host for link commit',
    defaultValue: '',
    required: true,
  },
  {
    flags: '-e, --tag-exists',
    description: 'tag already exists',
    defaultValue: false,
    required: true,
  },
  {
    flags: '-o, --output-file <file>',
    description: 'write the CHANGELOG to this file',
    required: false,
  },
]

export class GetChangelogCommand extends CustomCommand<GetChangelogData> {
  constructor() {
    super('get-changelog', 'Generate changelog', options)
  }

  protected async run(data: GetChangelogData): Promise<void> {
    const stream = await getChangelog(data)
    let outStream: Stream.Writable = process.stdout

    if (data.outputFile) {
      logger.silly('changelog-command', 'In')
      outStream = fs.createWriteStream(data.outputFile)
    }
    stream.pipe(outStream)
  }
}
