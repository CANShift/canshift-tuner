import { describe, it, expect } from 'vitest'
import { parseDtcBytes } from './dtc-ipc'

describe('parseDtcBytes', () => {
  it('accepts a valid byte array', () => {
    expect(parseDtcBytes([0x01, 0x33, 0x43, 0x01])).toEqual([0x01, 0x33, 0x43, 0x01])
    expect(parseDtcBytes([])).toEqual([])
  })

  it('rejects non-arrays', () => {
    expect(parseDtcBytes(undefined)).toBeNull()
    expect(parseDtcBytes(null)).toBeNull()
    expect(parseDtcBytes('0x01')).toBeNull()
    expect(parseDtcBytes({ 0: 1 })).toBeNull()
  })

  it('rejects out-of-range or non-integer bytes', () => {
    expect(parseDtcBytes([0x01, 256])).toBeNull()
    expect(parseDtcBytes([-1, 0x01])).toBeNull()
    expect(parseDtcBytes([0x01, 1.5])).toBeNull()
    expect(parseDtcBytes([0x01, '2'])).toBeNull()
  })
})
