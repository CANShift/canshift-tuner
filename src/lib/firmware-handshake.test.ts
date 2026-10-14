import { describe, expect, it } from 'vitest'
import { handshakeVerdict } from './firmware-handshake'

const identity = (version: string) => ({ version, protocol: 2, isDay: false })

describe('handshakeVerdict', () => {
  it('accepts firmware on the expected major', () => {
    expect(handshakeVerdict(identity('0.21.3'), 0)).toMatchObject({
      compat: { kind: 'compatible', protocol: 2 },
      level: 'success',
    })
  })

  it('flags another major and says burning is disabled', () => {
    const verdict = handshakeVerdict(identity('1.0.0'), 0)
    expect(verdict.compat).toEqual({ kind: 'mismatch', expected: 0, got: 1, version: '1.0.0' })
    expect(verdict.message).toMatch(/Burn disabled/)
  })
})
