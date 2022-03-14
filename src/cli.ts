#!/usr/bin/env node
import { program } from 'commander'
import { GetChangelogCommand } from './commands/get-changelog-command'
import { GetVersionsCommand } from './commands/get-versions-command'

async function main(): Promise<void> {
  program
    .name('conventional-tools')
    .addCommand(new GetVersionsCommand())
    .addCommand(new GetChangelogCommand())

  await program.parseAsync(process.argv);
}

void main()