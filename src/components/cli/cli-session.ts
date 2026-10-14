import type { CliContext, CliLine } from '../../lib/cli/commands'
import { findCommand } from '../../lib/cli/commands'
import { parseCommand } from '../../lib/cli/parse'

export const LINE_CAP = 200
export const HISTORY_CAP = 50
export const PROMPT = '>'

export const appendCapped = (lines: readonly CliLine[], next: readonly CliLine[]): CliLine[] => {
  const all = [...lines, ...next]
  return all.length > LINE_CAP ? all.slice(all.length - LINE_CAP) : all
}

export const withHistory = (history: readonly string[], raw: string): string[] =>
  [raw, ...history.filter((entry) => entry !== raw)].slice(0, HISTORY_CAP)

export const historyCursor = (cursor: number, direction: number, length: number): number =>
  Math.min(length - 1, Math.max(-1, cursor + direction))

export const runLine = (raw: string, context: CliContext): CliLine[] | null => {
  const invocation = parseCommand(raw)
  if (invocation === null) return null
  const echo: CliLine = { tone: 'out', text: `${PROMPT} ${raw.trim()}` }
  const command = findCommand(invocation.name)
  if (command === undefined) {
    return [echo, { tone: 'error', text: `No command "${invocation.name}". Try /help.` }]
  }
  return [echo, ...command.run(context, invocation.args)]
}
