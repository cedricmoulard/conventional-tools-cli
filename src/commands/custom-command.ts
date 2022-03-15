import { Command } from 'commander'
import { CommandData } from '../models/command-data'
import { Option } from '../models/option'
import * as logger from 'npmlog'

export abstract class CustomCommand<T extends CommandData> extends Command {
  protected constructor(name: string, description: string, options: Option[]) {
    super(name)
    this.description(description)

    this.option('-d, --debug <level>', 'output extra debugging (silly, verbose', 'silent')
    this.requiredOption('-p, --preset <preset>', 'preset to use', 'conventionalcommits')
    this.requiredOption('-t, --tag-prefix <prefix>', 'tag prefix to use', '')
    this.requiredOption('-s, --scopes <scopes>', 'conventional commits scope', '*')

    this.action((options: T) => {
      return this.preRun(options)
    })

    options.forEach(option => {
      if (option.required) {
        this.requiredOption(option.flags, option.description, option.defaultValue)
      } else {
        this.option(option.flags, option.description, option.defaultValue)
      }
    })
  }

  private async preRun(options: T): Promise<void> {
    // @ts-ignore
    logger.level = options.debug
    logger.info('[custom-command][preRun]', 'options: %j', options)
    return this.run(options)
  }

  protected abstract run(data: T): Promise<void>
}
