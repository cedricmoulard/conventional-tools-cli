#!/usr/bin/env node
import { program } from 'commander'
import { GetChangelogCommand } from './commands/get-changelog-command'
import { GetVersionsCommand } from './commands/get-versions-command'
import { LIB_VERSION } from './version';

async function main(): Promise<void> {
  program
    .name('conventional-tools')
    .version(LIB_VERSION)
    .addCommand(new GetVersionsCommand())
    .addCommand(new GetChangelogCommand())

  await program.parseAsync(process.argv);
}

void main()