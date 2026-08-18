import type { FlasherState } from '../../stores/flasher.store'

export type FlashStepId = 'connect' | 'check-model' | 'write' | 'verify' | 'reboot'
export type FlashStepStatus = 'done' | 'running' | 'pending'

export interface FlashStep {
  id: FlashStepId
  label: string
  status: FlashStepStatus
}

export interface FlashProgress {
  percent: number
  steps: FlashStep[]
  running: FlashStep | null
}

const LABELS: Record<FlashStepId, string> = {
  connect: 'CONNECT',
  'check-model': 'CHECK MODEL',
  write: 'WRITE',
  verify: 'VERIFY',
  reboot: 'REBOOT',
}

const ORDER: readonly FlashStepId[] = ['connect', 'check-model', 'write', 'verify', 'reboot']

const ENDS: Record<FlashStepId, number> = {
  connect: 8,
  'check-model': 12,
  write: 88,
  verify: 96,
  reboot: 100,
}

const HANDSHAKE_ESTIMATE_MS = 9_000
const SETTLE_ESTIMATE_MS = 7_000
const HANDSHAKE_CEILING = ENDS['check-model'] - 0.5
const SETTLE_CEILING = ENDS.reboot - 1

const ramp = (from: number, to: number, elapsedMs: number, overMs: number): number =>
  from + (to - from) * Math.min(1, elapsedMs / overMs)

const stepAt = (percent: number): FlashStepId => ORDER.find((id) => percent < ENDS[id]) ?? 'reboot'

const stepsAt = (percent: number, complete: boolean): FlashStep[] => {
  const current = stepAt(percent)
  return ORDER.map((id) => ({
    id,
    label: LABELS[id],
    status: complete ? 'done' : statusOf(id, current),
  }))
}

const statusOf = (id: FlashStepId, current: FlashStepId): FlashStepStatus => {
  if (id === current) return 'running'
  return ORDER.indexOf(id) < ORDER.indexOf(current) ? 'done' : 'pending'
}

const percentWhileFlashing = (written: number, total: number, phaseElapsedMs: number): number => {
  if (written <= 0 || total <= 0)
    return ramp(0, HANDSHAKE_CEILING, phaseElapsedMs, HANDSHAKE_ESTIMATE_MS)
  if (written >= total) return ramp(ENDS.write, SETTLE_CEILING, phaseElapsedMs, SETTLE_ESTIMATE_MS)
  return ENDS['check-model'] + (ENDS.write - ENDS['check-model']) * (written / total)
}

export const flashProgress = (state: FlasherState, phaseElapsedMs: number): FlashProgress => {
  if (state.kind === 'success') {
    const steps = stepsAt(ENDS.reboot, true)
    return { percent: 100, steps, running: null }
  }
  if (state.kind !== 'flashing') {
    const steps = stepsAt(0, false).map((step) => ({ ...step, status: 'pending' as const }))
    return { percent: 0, steps, running: null }
  }
  const percent = percentWhileFlashing(state.written, state.total, phaseElapsedMs)
  const steps = stepsAt(percent, false)
  return { percent, steps, running: steps.find((step) => step.status === 'running') ?? null }
}
