import { program } from 'commander'
import { GetVersionsCommand } from './commands/get-versions-command'

async function main() {
  program
    .name('conventional-tools')
    .addCommand(new GetVersionsCommand())

  await program.parseAsync(process.argv);
}

main()