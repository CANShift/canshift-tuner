import { describe, it, expect } from 'vitest'
import { formatFrameIdHex, parseHexFrameId } from './frame-id'

describe('parseHexFrameId', () => {
  it('parses a prefixed hex id', () => {
    expect(parseHexFrameId('0x370')).toBe(0x370)
    expect(parseHexFrameId('0X1E005000')).toBe(0x1e005000)
  })

  it('tolerates surrounding whitespace', () => {
    expect(parseHexFrameId('  0x7ff ')).toBe(0x7ff)
  })

  it('rejects a bare decimal-looking id instead of reading it as hex (#29.6)', () => {
    expect(parseHexFrameId('123')).toBe(-1)
  })

  it('rejects unprefixed hex and garbage', () => {
    expect(parseHexFrameId('1A')).toBe(-1)
    expect(parseHexFrameId('0xZZ')).toBe(-1)
    expect(parseHexFrameId('')).toBe(-1)
  })
})

describe('formatFrameIdHex', () => {
  it('pads standard 11-bit ids to three digits', () => {
    expect(formatFrameIdHex(0x60)).toBe('0x060')
    expect(formatFrameIdHex(0x7ff)).toBe('0x7FF')
  })

  it('pads extended ids to eight digits', () => {
    expect(formatFrameIdHex(0x800)).toBe('0x00000800')
    expect(formatFrameIdHex(0x1e005000)).toBe('0x1E005000')
  })

  it('round-trips with parseHexFrameId', () => {
    expect(parseHexFrameId(formatFrameIdHex(0x123))).toBe(0x123)
  })
})
