import { describe, expect, it } from 'vitest'
import { capabilityReason } from './capability'

describe('capabilityReason', () => {
  it('lets a wide window with WebSerial through to the app', () => {
    expect(capabilityReason(false, true)).toBeNull()
  })

  it('stops a window narrower than the floor', () => {
    expect(capabilityReason(true, true)).toBe('narrow')
  })

  it('names the missing capability ahead of the width, at any width', () => {
    expect(capabilityReason(false, false)).toBe('no-web-serial')
    expect(capabilityReason(true, false)).toBe('no-web-serial')
  })
})
