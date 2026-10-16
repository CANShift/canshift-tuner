import { describe, expect, it } from 'vitest'
import { CAN_SPEED_OPTIONS, parseCanSpeed } from './can-speed'

describe('CAN bus speed', () => {
  it('offers exactly the speeds the firmware accepts', () => {
    expect(CAN_SPEED_OPTIONS.map((option) => option.value)).toEqual(['125', '250', '500', '1000'])
  })

  it('parses only an accepted speed', () => {
    expect(parseCanSpeed('500')).toBe(500)
    expect(parseCanSpeed('300')).toBeNull()
    expect(parseCanSpeed('fast')).toBeNull()
  })
})
