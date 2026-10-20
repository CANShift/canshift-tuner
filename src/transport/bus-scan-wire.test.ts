import { describe, expect, it } from 'vitest'
import { parseBusScanReport } from './bus-scan-wire'

const DONE = {
  status: 'ok',
  state: 'done',
  outcome: 'detected',
  kbps: 500,
  window_ms: 3000,
  probes: [
    [500, 812, 0],
    [250, 0, 96],
  ],
  ids: [
    [880, 150],
    [881, 30],
  ],
  truncated: false,
}

describe('parseBusScanReport progress', () => {
  it('reads an idle dash', () => {
    expect(parseBusScanReport({ status: 'ok', state: 'idle' })).toEqual({ state: 'idle' })
  })

  it('reads the rate under test', () => {
    const wire = { status: 'ok', state: 'probing', kbps: 250, step: 2, steps: 5 }
    expect(parseBusScanReport(wire)).toEqual({ state: 'probing', kbps: 250, step: 2, steps: 5 })
  })
})

describe('parseBusScanReport results', () => {
  it('turns frame counts into rates over the window', () => {
    expect(parseBusScanReport(DONE)).toEqual({
      state: 'done',
      result: {
        outcome: 'detected',
        kbps: 500,
        probes: [
          { kbps: 500, frames: 812, busErrors: 0 },
          { kbps: 250, frames: 0, busErrors: 96 },
        ],
        frames: [
          { id: 880, count: 150, rateHz: 50 },
          { id: 881, count: 30, rateHz: 10 },
        ],
        truncated: false,
      },
    })
  })
})

describe('parseBusScanReport rejections', () => {
  it.each([
    ['an unknown state', { state: 'warming' }],
    ['an unknown outcome', { ...DONE, outcome: 'maybe' }],
    ['a malformed id pair', { ...DONE, ids: [[880]] }],
    ['a zero window', { ...DONE, window_ms: 0 }],
    ['no payload', undefined],
  ])('rejects %s', (_label, wire) => {
    expect(parseBusScanReport(wire)).toBeNull()
  })
})
