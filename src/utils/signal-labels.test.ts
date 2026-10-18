import { describe, expect, it } from 'vitest'
import { displayLabelForSignal } from './signal-labels'

describe('displayLabelForSignal', () => {
  it('names the six default pages the way the design comp does', () => {
    expect(displayLabelForSignal('coolant_temp_c')).toBe('WATER')
    expect(displayLabelForSignal('oil_temp_c')).toBe('OIL T')
    expect(displayLabelForSignal('oil_press_bar')).toBe('OIL PRESS')
    expect(displayLabelForSignal('fuel_level_pct')).toBe('FUEL')
    expect(displayLabelForSignal('odo_km')).toBe('ODO')
  })

  it('never gives two signals the same label, or a page reads OIL twice', () => {
    const signals = [
      'oil_temp_c',
      'oil_press_bar',
      'fuel_press_bar',
      'fuel_level_pct',
      'boost_bar',
      'boost_target_bar',
    ]
    const labels = signals.map(displayLabelForSignal)
    expect(new Set(labels).size).toBe(signals.length)
  })

  it('falls back to the signal name for anything it does not curate', () => {
    expect(displayLabelForSignal('brake_temp_fl')).toBe('BRAKE TEMP FL')
    expect(displayLabelForSignal('')).toBe('—')
  })
})
