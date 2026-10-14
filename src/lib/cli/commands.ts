import { out } from './context'
import { BOOT, LS, PAGE } from './page-commands'
import { BIND, COPY, PASTE, SPAN, TYPE } from './widget-commands'
import { ALERT, EXPORT, ID, IMPORT, SAVE, THEME, UNDO } from './config-commands'
import { BURN, OPCODES, RAW, SCAN } from './device-commands'
import type { CliCommand } from './types'

export type {
  CliActions,
  CliCommand,
  CliContext,
  CliLine,
  CliTone,
  KnownOpcode,
  RawResult,
} from './types'

const HELP: CliCommand = {
  name: 'help',
  hint: 'list every command',
  run: () => COMMANDS.map((command) => out(`/${command.name.padEnd(8)} ${command.hint}`)),
}

export const COMMANDS: readonly CliCommand[] = [
  HELP,
  OPCODES,
  RAW,
  LS,
  PAGE,
  BOOT,
  BIND,
  SPAN,
  TYPE,
  ID,
  THEME,
  ALERT,
  COPY,
  PASTE,
  UNDO,
  SCAN,
  SAVE,
  EXPORT,
  IMPORT,
  BURN,
]

export const COMMAND_NAMES: readonly string[] = COMMANDS.map((command) => command.name)

export const findCommand = (name: string): CliCommand | undefined =>
  COMMANDS.find((command) => command.name === name)
