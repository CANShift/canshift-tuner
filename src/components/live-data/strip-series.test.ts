import { describe, expect, it } from 'vitest'
import type { LiveSample } from '../../hooks/useLiveSampler'
import { STRIP_VIEW_HEIGHT, buildStrip, timeTicks, timeWindowOf } from './strip-series'

const sample = (t: number, values: Record<string, number>): LiveSample => ({ t, values })

const SAMPLES = [
  sample(0, { rpm: 1000 }),
  sample(1, { rpm: 3000, boost_bar: 0.5 }),
  sample(2, { rpm: 2000, boost_bar: 1.5 }),
]

describe('buildStrip', () => {
  it('scales each signal to its own range and keeps the latest value', () => {
    const strip = buildStrip('rpm', SAMPLES, timeWindowOf(SAMPLES))
    expect(strip).toMatchObject({ min: 1000, max: 3000, latest: 2000 })
    expect(strip?.path).toBe(`M0.0 ${STRIP_VIEW_HEIGHT.toFixed(1)} L500.0 0.0 L1000.0 50.0`)
  })

  it('places a late signal on the shared time axis', () => {
    const strip = buildStrip('boost_bar', SAMPLES, timeWindowOf(SAMPLES))
    expect(strip?.path).toBe('M500.0 100.0 L1000.0 0.0')
  })

  it('draws a flat line through the middle of a constant signal', () => {
    const flat = [sample(0, { gear: 3 }), sample(1, { gear: 3 })]
    expect(buildStrip('gear', flat, timeWindowOf(flat))?.path).toBe('M0.0 100.0 L1000.0 100.0')
  })

  it('returns null with fewer than two points', () => {
    expect(buildStrip('boost_bar', SAMPLES.slice(0, 2), timeWindowOf(SAMPLES))).toBeNull()
  })
})

describe('timeTicks', () => {
  it('labels ticks back from now at a readable step', () => {
    expect(timeTicks({ start: 0, end: 40 }).map((tick) => tick.label)).toEqual([
      'now',
      '−10 s',
      '−20 s',
      '−30 s',
      '−40 s',
    ])
  })

  it('positions the newest tick at the right edge', () => {
    const [newest, middle] = timeTicks({ start: 10, end: 12 })
    expect(newest?.offset).toBe(1)
    expect(middle?.offset).toBe(0.5)
  })

  it('has no ticks for an empty window', () => {
    expect(timeTicks({ start: 4, end: 4 })).toEqual([])
  })
})
