import type { SignalDef } from '@canshift/core'

const PHASE_STEP = 1.3
const BASE_PERIOD_S = 8
const PERIOD_VARIANTS = 5
const PERIOD_STEP_S = 2

const sweep = (index: number, seconds: number): number => {
  const phase = (index * PHASE_STEP) % (2 * Math.PI)
  const period = BASE_PERIOD_S + (index % PERIOD_VARIANTS) * PERIOD_STEP_S
  return (Math.sin((seconds * 2 * Math.PI) / period + phase) + 1) / 2
}

export const simulatedValues = (
  signals: readonly SignalDef[],
  seconds: number
): Record<string, number> =>
  Object.fromEntries(
    signals.map((sig, i) => [sig.name, sig.min + sweep(i, seconds) * (sig.max - sig.min)])
  )
