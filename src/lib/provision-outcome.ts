import type { LogLevel } from '../stores/log.store'
import { transportErrorText } from '../transport/humanize-transport-error'
import type { BoardProfileWriteResult } from './board-provision'

export type ProvisionState =
  | { kind: 'idle' }
  | { kind: 'writing' }
  | { kind: 'ok'; restart: boolean }
  | { kind: 'invalid' }
  | { kind: 'unknown-board' }
  | { kind: 'error'; message: string }

export interface ProvisionOutcome {
  state: ProvisionState
  level: LogLevel
  log: string
}

type OutcomeOf = (result: BoardProfileWriteResult, boardId: string) => ProvisionOutcome

export const failedOutcome = (message: string): ProvisionOutcome => ({
  state: { kind: 'error', message },
  level: 'error',
  log: `Board profile write failed: ${message}`,
})

const savedOutcome = (restart: boolean): ProvisionOutcome => ({
  state: { kind: 'ok', restart },
  level: 'success',
  log: restart ? 'Board profile saved — the dash is rebooting to apply it' : 'Board profile saved',
})

const OUTCOMES: Record<BoardProfileWriteResult['kind'], OutcomeOf> = {
  ok: (result) => savedOutcome(result.kind === 'ok' && result.restart),
  invalid: () => ({
    state: { kind: 'invalid' },
    level: 'error',
    log: 'Firmware rejected the board profile (invalid_board_profile)',
  }),
  'unknown-board': (_result, boardId) => ({
    state: { kind: 'unknown-board' },
    level: 'error',
    log: `This build has no board called “${boardId}”`,
  }),
  error: (result) => failedOutcome(transportErrorText(result.kind === 'error' ? result.error : '')),
}

export const provisionOutcome: OutcomeOf = (result, boardId) =>
  OUTCOMES[result.kind](result, boardId)
