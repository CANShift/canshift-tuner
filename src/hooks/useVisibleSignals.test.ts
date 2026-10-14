import { describe, expect, it } from 'vitest'
import type { SignalDef } from '@canshift/core'
import { visibleSignals } from './useVisibleSignals'

const signal = (name: string, canFrameId = '0x370', unit = ''): SignalDef =>
  ({ name, canFrameId, unit, startByte: 0, byteLength: 1 }) as SignalDef

const SIGNALS = [
  signal('rpm', '0x370', 'rpm'),
  signal('coolant_temp_c', '0x372', 'C'),
  signal('map_kpa'),
]
const USAGE = new Map([
  ['rpm', [1]],
  ['coolant_temp_c', [2]],
])

const names = (list: readonly SignalDef[]): string[] => list.map((s) => s.name)

describe('visibleSignals', () => {
  it('shows everything with no filter', () => {
    expect(names(visibleSignals(SIGNALS, USAGE, { filter: '', hideUnused: false }))).toHaveLength(3)
  })

  it('hides the signals no page uses', () => {
    const shown = visibleSignals(SIGNALS, USAGE, { filter: '', hideUnused: true })
    expect(names(shown)).toEqual(['rpm', 'coolant_temp_c'])
  })

  it('finds a signal by its dash label as well as its key', () => {
    expect(names(visibleSignals(SIGNALS, USAGE, { filter: 'water', hideUnused: false }))).toEqual([
      'coolant_temp_c',
    ])
    expect(names(visibleSignals(SIGNALS, USAGE, { filter: '0x372', hideUnused: false }))).toEqual([
      'coolant_temp_c',
    ])
  })
})
