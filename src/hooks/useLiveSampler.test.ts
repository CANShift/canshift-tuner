import { describe, expect, it } from 'vitest'
import { WINDOW_MAX_S, appendSample, lastSeconds, type LiveSample } from './useLiveSampler'

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
