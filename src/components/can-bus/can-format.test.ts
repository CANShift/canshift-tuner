import { describe, expect, it } from 'vitest'
import { formatCount, formatPayload, hexByte } from './can-format'

describe('can formatting', () => {
  it('abbreviates large counts', () => {
    expect(formatCount(999)).toBe('999')
    expect(formatCount(1_500)).toBe('1.5k')
    expect(formatCount(2_000_000)).toBe('2.0M')
  })

  it('prints payload bytes as padded hex up to the DLC', () => {
    expect(hexByte(10)).toBe('0A')
    expect(formatPayload([1, 255, 16, 4], 3)).toBe('01 FF 10')
  })
})
