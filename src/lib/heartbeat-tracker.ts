import type { FirmwareLiveness } from '../stores/device.store'
import type { PingResult } from '../transport/types'

export const HEARTBEAT_MISS_THRESHOLD = 3

export interface HeartbeatOutcome {
  liveness: FirmwareLiveness | null
  reportUnresponsive: boolean
}

const UNCHANGED: HeartbeatOutcome = { liveness: null, reportUnresponsive: false }

export class HeartbeatTracker {
  private missed = 0
  private firstMissedAt: number | null = null
  private reported = false

  missedPings(): number {
    return this.missed
  }

  record(result: PingResult, now: number): HeartbeatOutcome {
    if (result.kind === 'ok') return this.pong(result.uptimeMs, now)
    return this.miss(now)
  }

  private pong(uptimeMs: number | null, now: number): HeartbeatOutcome {
    this.missed = 0
    this.firstMissedAt = null
    this.reported = false
    return { liveness: { kind: 'alive', lastPongAt: now, uptimeMs }, reportUnresponsive: false }
  }

  private miss(now: number): HeartbeatOutcome {
    this.missed += 1
    this.firstMissedAt ??= now
    if (this.missed < HEARTBEAT_MISS_THRESHOLD) return UNCHANGED
    const reportUnresponsive = !this.reported
    this.reported = true
    return {
      liveness: { kind: 'unresponsive', missedPings: this.missed, sinceMs: this.firstMissedAt },
      reportUnresponsive,
    }
  }
}
