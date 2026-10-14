import { describe, expect, it } from 'vitest'
import type { CliContext } from '../../lib/cli/commands'
import {
  HISTORY_CAP,
  LINE_CAP,
  appendCapped,
  historyCursor,
  runLine,
  withHistory,
} from './cli-session'

const context = {
  config: null,
  selectedPageId: null,
  signals: [],
  hasDevice: false,
} as unknown as CliContext

describe('cli session history', () => {
  it('keeps only the newest lines', () => {
    const many = Array.from({ length: LINE_CAP }, (_, i) => ({
      tone: 'out' as const,
      text: String(i),
    }))
    const next = appendCapped(many, [{ tone: 'ok', text: 'last' }])
    expect(next).toHaveLength(LINE_CAP)
    expect(next[next.length - 1]?.text).toBe('last')
  })

  it('moves a repeated command to the front of a capped history', () => {
    expect(withHistory(['/a', '/b'], '/b')).toEqual(['/b', '/a'])
    expect(
      withHistory(
        Array.from({ length: HISTORY_CAP }, (_, i) => `/${String(i)}`),
        '/x'
      )
    ).toHaveLength(HISTORY_CAP)
  })

  it('clamps the history cursor between the prompt and the oldest entry', () => {
    expect(historyCursor(-1, -1, 3)).toBe(-1)
    expect(historyCursor(2, 1, 3)).toBe(2)
  })
})

describe('cli session lines', () => {
  it('echoes the input and reports an unknown command', () => {
    expect(runLine('  ', context)).toBeNull()
    expect(runLine('/nope', context)).toEqual([
      { tone: 'out', text: '> /nope' },
      { tone: 'error', text: 'No command "nope". Try /help.' },
    ])
  })
})
