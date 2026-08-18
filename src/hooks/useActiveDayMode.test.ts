import { describe, expect, it } from 'vitest'
import { activeDayMode } from './useActiveDayMode'

describe('activeDayMode', () => {
  it('follows the device once it has reported a mode', () => {
    expect(activeDayMode(true, false)).toBe(true)
    expect(activeDayMode(false, true)).toBe(false)
  })

  it('falls back to the preview switch while no device has reported one', () => {
    expect(activeDayMode(null, true)).toBe(true)
    expect(activeDayMode(null, false)).toBe(false)
  })
})
