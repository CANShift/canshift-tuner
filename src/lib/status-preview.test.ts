import { describe, expect, it } from 'vitest'
import { previewItemText } from './status-preview'

describe('status-row preview text', () => {
  it('prints a value without a unit as configured', () => {
    expect(
      previewItemText(
        { type: 'signal', signal: 'trip_km', format: 'TRIP %.0f km', position: 'right' },
        'imperial'
      )
    ).toBe('TRIP 128 km')
  })

  it('converts a value with a unit and appends the symbol', () => {
    const item = {
      type: 'signal',
      signal: 'trip_km',
      format: 'TRIP %.0f',
      unit: 'km',
      showUnit: true,
      position: 'right',
    } as const
    expect(previewItemText(item, 'imperial')).toBe('TRIP 80 mi')
    expect(previewItemText(item, 'metric')).toBe('TRIP 128 km')
  })
})

describe('status-row preview text for a session max', () => {
  it('drops a decimal where the converted pressure gains a digit', () => {
    const item = {
      type: 'signalMax',
      signal: 'boost_bar',
      text: 'PEAK',
      format: '%.2f',
      unit: 'bar',
      position: 'right',
    } as const
    expect(previewItemText(item, 'imperial')).toBe('PEAK 23.4')
    expect(previewItemText(item, 'metric')).toBe('PEAK 1.61')
  })

  it('converts a session max without a symbol', () => {
    const item = {
      type: 'signalMax',
      signal: 'oil_temp_c',
      text: 'MAX OIL',
      format: '%.0f',
      unit: '°C',
      position: 'right',
    } as const
    expect(previewItemText(item, 'imperial')).toBe('MAX OIL 203')
  })
})

describe('status-row preview text for timing and flags', () => {
  it('prefixes a timer field', () => {
    expect(
      previewItemText(
        { type: 'timer', source: 'lapCount', text: 'LAP', position: 'center' },
        'metric'
      )
    ).toBe('LAP 4')
  })

  it('shows the on word of a flag', () => {
    expect(
      previewItemText(
        {
          type: 'flagWord',
          signal: 'flag_launch_ctrl',
          text: 'ARMED',
          offText: 'LAUNCH OFF',
          position: 'right',
        },
        'metric'
      )
    ).toBe('ARMED')
  })
})
