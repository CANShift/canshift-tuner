import { describe, expect, it } from 'vitest'
import {
  MAX_RECORDED_SAMPLES,
  WINDOW_MAX_S,
  appendSample,
  lastSeconds,
  recordingFull,
  type LiveSample,
} from './useLiveSampler'

const at = (t: number): LiveSample => ({ t, values: {} })

describe('appendSample', () => {
  it('drops samples older than the longest window', () => {
    const history = [at(0), at(1), at(2)]
    const next = appendSample(history, at(WINDOW_MAX_S + 1.5))
    expect(next.map((s) => s.t)).toEqual([2, WINDOW_MAX_S + 1.5])
  })
})

describe('lastSeconds', () => {
  it('keeps the samples within the chosen window of the latest one', () => {
    expect(lastSeconds([at(0), at(4), at(9), at(10)], 5).map((s) => s.t)).toEqual([9, 10])
  })
})

describe('recordingFull', () => {
  it('stops a recording once it holds the maximum number of samples', () => {
    expect(recordingFull(MAX_RECORDED_SAMPLES - 1)).toBe(false)
    expect(recordingFull(MAX_RECORDED_SAMPLES)).toBe(true)
  })
})
