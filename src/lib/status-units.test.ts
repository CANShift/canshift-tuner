import { describe, expect, it } from 'vitest'
import type { SignalDef } from '@canshift/core'
import {
  canConvert,
  declaredUnitOf,
  withConversion,
  withShowUnit,
  withSignal,
} from './status-units'

const signals = [
  { name: 'trip_km', unit: 'km' },
  { name: 'battery_volts', unit: 'V' },
] as SignalDef[]

const trip = { type: 'signal', signal: 'trip_km', format: 'TRIP %.0f', position: 'right' } as const

describe('status-row units', () => {
  it('reads the declared unit of a signal', () => {
    expect(declaredUnitOf(signals, 'trip_km')).toBe('km')
    expect(declaredUnitOf(signals, 'missing')).toBe('')
  })

  it('only converts a unit with an imperial pair', () => {
    expect(canConvert('km')).toBe(true)
    expect(canConvert('V')).toBe(false)
    expect(canConvert('')).toBe(false)
  })

  it('sets and clears the unit with the conversion switch', () => {
    const converting = withConversion(trip, true, 'km')
    expect(converting.unit).toBe('km')
    const shown = withShowUnit(converting, true)
    expect(withConversion(shown, false, 'km')).toEqual(trip)
  })

  it('follows the new signal unit while converting and drops it when unpaired', () => {
    const converting = withConversion(trip, true, 'km')
    expect(withSignal(converting, 'battery_volts', 'V')).not.toHaveProperty('unit')
    expect(withSignal(trip, 'battery_volts', 'V')).not.toHaveProperty('unit')
  })

  it('removes showUnit when switched off', () => {
    expect(withShowUnit({ ...trip, showUnit: true }, false)).not.toHaveProperty('showUnit')
  })
})
