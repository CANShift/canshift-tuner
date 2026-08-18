import { describe, expect, it } from 'vitest'
import { formatByteRange, parseByteRange } from './signal-bytes'

describe('formatByteRange', () => {
  it('shows a single byte as one number, not a range of itself', () => {
    expect(formatByteRange(3, 1)).toBe('3')
  })

  it('shows a multi-byte signal as an inclusive range', () => {
    expect(formatByteRange(0, 2)).toBe('0–1')
    expect(formatByteRange(4, 4)).toBe('4–7')
  })
})

describe('parseByteRange', () => {
  it('reads back what it wrote', () => {
    expect(parseByteRange('0–1')).toEqual({ startByte: 0, byteLength: 2 })
    expect(parseByteRange('3')).toEqual({ startByte: 3, byteLength: 1 })
  })

  it('accepts a plain hyphen, which is what a keyboard types', () => {
    expect(parseByteRange('4-7')).toEqual({ startByte: 4, byteLength: 4 })
  })

  it('tolerates surrounding whitespace', () => {
    expect(parseByteRange('  2 - 3 ')).toEqual({ startByte: 2, byteLength: 2 })
  })

  it('refuses a range the frame cannot hold', () => {
    expect(parseByteRange('6–9')).toBeNull()
    expect(parseByteRange('8')).toBeNull()
  })

  it('refuses a length the schema does not allow', () => {
    expect(parseByteRange('0–4')).toBeNull()
  })

  it('refuses a reversed range instead of silently swapping it', () => {
    expect(parseByteRange('3–1')).toBeNull()
  })

  it('refuses anything that is not a range', () => {
    expect(parseByteRange('')).toBeNull()
    expect(parseByteRange('0x1D0')).toBeNull()
  })
})
