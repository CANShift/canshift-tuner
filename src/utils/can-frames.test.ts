import { describe, it, expect } from 'vitest'
import type { CanFrameStats } from '../hooks/useCanScanner'
import { buildDraftSignal, sortFrames } from './can-frames'

const frame = (over: Partial<CanFrameStats>): CanFrameStats => ({
  id: 0x100,
  firstSeenMs: 0,
  lastSeenMs: 0,
  count: 0,
  rateHz: 0,
  lastDlc: 8,
  lastPayload: [],
  byteValueCounts: [],
  ...over,
})

const ids = (frames: CanFrameStats[]): number[] => frames.map((f) => f.id)

describe('sortFrames', () => {
  const a = frame({ id: 0x200, lastSeenMs: 10, rateHz: 5, count: 100 })
  const b = frame({ id: 0x100, lastSeenMs: 30, rateHz: 1, count: 300 })
  const c = frame({ id: 0x300, lastSeenMs: 20, rateHz: 9, count: 200 })
  const frames = [a, b, c]

  it('sorts by id ascending', () => {
    expect(ids(sortFrames(frames, 'id', null))).toEqual([0x100, 0x200, 0x300])
  })

  it('sorts by lastSeen descending', () => {
    expect(ids(sortFrames(frames, 'lastSeen', null))).toEqual([0x100, 0x300, 0x200])
  })

  it('sorts by rate descending', () => {
    expect(ids(sortFrames(frames, 'rate', null))).toEqual([0x300, 0x200, 0x100])
  })

  it('sorts by count descending', () => {
    expect(ids(sortFrames(frames, 'count', null))).toEqual([0x100, 0x300, 0x200])
  })

  it('sorts by learn activity, falling back to id for ties', () => {
    const scores = new Map([
      [0x200, 9],
      [0x100, 9],
      [0x300, 1],
    ])
    expect(ids(sortFrames(frames, 'activity', scores))).toEqual([0x100, 0x200, 0x300])
  })

  it('does not mutate the input array', () => {
    const input = [a, b, c]
    sortFrames(input, 'id', null)
    expect(ids(input)).toEqual([0x200, 0x100, 0x300])
  })
})

describe('buildDraftSignal', () => {
  it('names the signal from the existing count and formats the frame id', () => {
    const draft = buildDraftSignal(0x360, 2)
    expect(draft.name).toBe('scan_signal_3')
    expect(draft.canFrameId).toBe('0x360')
  })

  it('produces a byte-0 single-byte default binding', () => {
    const draft = buildDraftSignal(0x100, 0)
    expect(draft).toMatchObject({ startByte: 0, byteLength: 1, min: 0, max: 255, timeoutMs: 2_000 })
  })
})
