import { describe, expect, it } from 'vitest'
import { HEARTBEAT_MISS_THRESHOLD, HeartbeatTracker } from './heartbeat-tracker'

const MISS = { kind: 'error', error: 'ack_timeout' } as const
const PONG = { kind: 'ok', uptimeMs: 42, configReload: null } as const

const missTimes = (tracker: HeartbeatTracker, count: number, start: number) =>
  Array.from({ length: count }, (_, i) => tracker.record(MISS, start + i))

describe('HeartbeatTracker', () => {
  it('reports alive with the pong time and uptime', () => {
    expect(new HeartbeatTracker().record(PONG, 1000)).toEqual({
      liveness: { kind: 'alive', lastPongAt: 1000, uptimeMs: 42 },
      reportUnresponsive: false,
    })
  })

  it('stays silent until the miss threshold, then reports once since the first miss', () => {
    const outcomes = missTimes(new HeartbeatTracker(), HEARTBEAT_MISS_THRESHOLD + 1, 100)
    expect(outcomes.slice(0, HEARTBEAT_MISS_THRESHOLD - 1).every((o) => o.liveness === null)).toBe(
      true
    )
    expect(outcomes[HEARTBEAT_MISS_THRESHOLD - 1]).toEqual({
      liveness: { kind: 'unresponsive', missedPings: 3, sinceMs: 100 },
      reportUnresponsive: true,
    })
    expect(outcomes[HEARTBEAT_MISS_THRESHOLD]?.reportUnresponsive).toBe(false)
  })

  it('starts over after a pong', () => {
    const tracker = new HeartbeatTracker()
    missTimes(tracker, HEARTBEAT_MISS_THRESHOLD, 0)
    tracker.record(PONG, 50)
    const again = missTimes(tracker, HEARTBEAT_MISS_THRESHOLD, 60)
    expect(again[HEARTBEAT_MISS_THRESHOLD - 1]).toMatchObject({
      liveness: { sinceMs: 60 },
      reportUnresponsive: true,
    })
  })
})
