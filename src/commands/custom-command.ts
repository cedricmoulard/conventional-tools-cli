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

    this.action((command: CustomCommand<T>) => {
      // @ts-ignore
      return this.preRun(command.opts())
    })
    options.forEach(option => {
      if (option.required) {
        this.requiredOption(option.flags, option.description, option.defaultValue)
      } else {
        this.option(option.flags, option.description, option.defaultValue)
      }
    })
  }

  private async preRun(data: T): Promise<void> {
    // @ts-ignore
    logger.level = data.debug
    logger.info('[custom-command][preRun]', 'data: %j', data)
    return this.run(data)
  }

  protected abstract run(data: T): Promise<void>
}
