import { describe, expect, it } from 'vitest'
import { DEFAULT_SIM_SIGNALS } from '../../config/default-sim-signals'
import { rawFromShown, rescaled, shownFromRaw } from './reading'
import { liveCount, signalRows } from './signal-rows'

describe('signal rows', () => {
  const [first, second] = DEFAULT_SIM_SIGNALS
  if (!first || !second) throw new Error('the demo car has signals')

  it('lists the signals with no data first', () => {
    const rows = signalRows([first, second], { [first.name]: 1 })
    expect(rows.map((row) => row.signal.name)).toEqual([second.name, first.name])
    expect(liveCount(rows)).toBe(1)
  })
})

describe('adjusting a reading', () => {
  const catalogue = { scale: 0.1, offset: 0 }

  it('recovers what the car sends from what the dash shows', () => {
    expect(rawFromShown(38, catalogue)).toBeCloseTo(380)
    expect(shownFromRaw(380, { scale: 0.01, offset: 0 })).toBeCloseTo(3.8)
  })

  it('shows what the dash would show with the new numbers', () => {
    expect(rescaled(38, catalogue, { scale: 0.01, offset: 0 })).toBeCloseTo(3.8)
    expect(rescaled(38, catalogue, { scale: 0.01, offset: 1 })).toBeCloseTo(4.8)
  })

  it('never divides by a zero scale', () => {
    expect(rawFromShown(5, { scale: 0, offset: 0 })).toBe(5)
  })
})
