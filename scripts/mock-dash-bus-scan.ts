import { ok, type Command, type Outcome } from './mock-dash-replies'
import type { MockDashState } from './mock-dash-state'

const RATES_KBPS = [500, 250, 1000, 125]
const PROBE_MS = 500
const COLLECT_MS = 3_000
const PROBING_MS = RATES_KBPS.length * PROBE_MS
const STEPS = RATES_KBPS.length + 1
const DETECTED_KBPS = 500
const FRAMES_PER_WINDOW = 150
const MAXXECU_IDS = [0x370, 0x371, 0x372, 0x373, 0x374, 0x375]
const OEM_IDS = [0x0c9, 0x1e5, 0x3e9]

const probes = (): number[][] =>
  RATES_KBPS.map((kbps) => (kbps === DETECTED_KBPS ? [kbps, 812, 0] : [kbps, 0, 64]))

const doneReply = (): Outcome =>
  ok({
    state: 'done',
    outcome: 'detected',
    kbps: DETECTED_KBPS,
    window_ms: COLLECT_MS,
    probes: probes(),
    ids: [...MAXXECU_IDS, ...OEM_IDS].map((id) => [id, FRAMES_PER_WINDOW]),
    truncated: false,
  })

const progressReply = (elapsedMs: number): Outcome => {
  if (elapsedMs >= PROBING_MS) {
    return ok({ state: 'collecting', kbps: DETECTED_KBPS, step: STEPS, steps: STEPS })
  }
  const index = Math.floor(elapsedMs / PROBE_MS)
  return ok({ state: 'probing', kbps: RATES_KBPS[index], step: index + 1, steps: STEPS })
}

export const busScanStart = (_command: Command, state: MockDashState): Outcome => {
  state.busScanStartedAt = Date.now()
  return ok()
}

export const busScanPoll = (_command: Command, state: MockDashState): Outcome => {
  if (state.busScanStartedAt === null) return ok({ state: 'idle' })
  const elapsedMs = Date.now() - state.busScanStartedAt
  return elapsedMs >= PROBING_MS + COLLECT_MS ? doneReply() : progressReply(elapsedMs)
}
