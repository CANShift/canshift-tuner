import { describe, expect, it } from 'vitest'
import type { SignalDef } from '@canshift/core'
import { groupByFrame } from './signal-frames'

const signal = (name: string, canFrameId: string): SignalDef =>
  ({ name, canFrameId, startByte: 0, byteLength: 1 }) as SignalDef

describe('groupByFrame', () => {
  it('groups signals under their CAN frame, keeping their order inside the frame', () => {
    const frames = groupByFrame([
      signal('rpm', '0x370'),
      signal('gear', '0x371'),
      signal('tps', '0x370'),
    ])
    expect(frames.map((frame) => frame.frameId)).toEqual(['0x370', '0x371'])
    expect(frames[0]?.signals.map((s) => s.name)).toEqual(['rpm', 'tps'])
  })

  it('orders frames by numeric id, with unparsable ids last', () => {
    const frames = groupByFrame([signal('a', '0x7E8'), signal('b', 'polled'), signal('c', '0x100')])
    expect(frames.map((frame) => frame.frameId)).toEqual(['0x100', '0x7E8', 'polled'])
  })
})
