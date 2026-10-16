import { describe, expect, it } from 'vitest'
import { activeDayMode } from './useActiveDayMode'

describe('activeDayMode', () => {
  it('follows the device once it has reported a mode', () => {
    expect(activeDayMode(true)).toBe(true)
    expect(activeDayMode(false)).toBe(false)
  })

  it('shows night while no device has reported one', () => {
    expect(activeDayMode(null)).toBe(false)
  })
})
