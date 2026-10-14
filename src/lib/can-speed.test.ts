import { describe, expect, it } from 'vitest'
import { DEFAULT_DEVICE_CONFIG } from '@canshift/core'
import { CAN_SPEED_OPTIONS, canSpeedNote, configOf, parseCanSpeed } from './can-speed'

describe('CAN bus speed', () => {
  it('offers exactly the speeds the firmware accepts', () => {
    expect(CAN_SPEED_OPTIONS.map((option) => option.value)).toEqual(['125', '250', '500', '1000'])
  })

  it('parses only an accepted speed', () => {
    expect(parseCanSpeed('500')).toBe(500)
    expect(parseCanSpeed('300')).toBeNull()
    expect(parseCanSpeed('fast')).toBeNull()
  })

  it('falls back to the default config until the dash answers', () => {
    expect(configOf({ kind: 'reading' })).toEqual(DEFAULT_DEVICE_CONFIG)
    const config = { ...DEFAULT_DEVICE_CONFIG, canSpeedKbps: 250 as const }
    expect(configOf({ kind: 'ready', config })).toBe(config)
  })

  it('warns that writing reboots the dash, and shows the humanised error', () => {
    expect(canSpeedNote({ kind: 'ready', config: DEFAULT_DEVICE_CONFIG })).toContain('reboots')
    const error = { kind: 'error' as const, config: DEFAULT_DEVICE_CONFIG, message: 'Cable?' }
    expect(canSpeedNote(error)).toBe('Cable?')
  })
})
