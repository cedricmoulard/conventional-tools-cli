import * as logger from 'npmlog'
import { CommandData } from '../models/command-data'

export const buildPattern = (data: CommandData): RegExp => {
  logger.verbose('[utils][buildPattern]', 'Build pattern with scope "%s"', data.scopes)
  let scopes = data.scopes
  if (!scopes || scopes === '*') {
    scopes = '[\\w\\$\\.\\-\\* ]*'
  }

  const pattern = `^(\\w*)(?:\\((${scopes})\\))?!?\\: (.*)$`
  return new RegExp(pattern)
}
