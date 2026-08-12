import type { SignalDef } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { signalRowKey } from './SignalPreviewTable'

const signal = (name: string, canFrameId: string, startByte: number): SignalDef =>
  ({
    name,
    canFrameId,
    startByte,
    byteLength: 2,
    scale: 1,
    offset: 0,
    signed: false,
    bigEndian: false,
    unit: '',
    min: 0,
    max: 100,
  }) as SignalDef

describe('signalRowKey', () => {
  it('keeps colliding signal names on distinct keys so neither row is dropped', () => {
    const lambdaA = signal('channel_254', '0x520', 6)
    const lambdaB = signal('channel_254', '0x521', 0)

    expect(signalRowKey(lambdaA, 0)).not.toBe(signalRowKey(lambdaB, 1))
  })

  it('separates rows that collide on every field a profile can repeat', () => {
    const placeholders = Array.from({ length: 8 }, () => signal('channel_placeholder', '0x600', 0))
    const keys = placeholders.map(signalRowKey)

    expect(new Set(keys).size).toBe(placeholders.length)
  })

  it('carries the signal name so a key stays readable next to the rendered row', () => {
    expect(signalRowKey(signal('rpm', '0x100', 0), 3)).toContain('rpm')
  })
})
