import simSignals from '../src/config/default-sim-signals.json' with { type: 'json' }

interface SimSignal {
  name: string
  min: number
  max: number
}

const SIGNALS: readonly SimSignal[] = simSignals
const TWO_PI = 2 * Math.PI
const BASE_PERIOD_S = 8
const PERIOD_STEP_S = 2
const PERIOD_VARIANTS = 5
const PHASE_STEP = 1.3
const MOCK_FREE_HEAP = 180_000
const MOCK_LARGEST_BLOCK = 96_000
const MOCK_FRAME_RATE = 842

const waveValue = (signal: SimSignal, index: number, seconds: number): number => {
  const period = BASE_PERIOD_S + (index % PERIOD_VARIANTS) * PERIOD_STEP_S
  const phase = (index * PHASE_STEP) % TWO_PI
  const share = (Math.sin((seconds * TWO_PI) / period + phase) + 1) / 2
  return signal.min + share * (signal.max - signal.min)
}

export const teleFrame = (seconds: number): Record<string, unknown> => ({
  tele: 1,
  v: Object.fromEntries(
    SIGNALS.map((signal, index) => [signal.name, waveValue(signal, index, seconds)])
  ),
})

export const heapFrame = (uptimeMs: number): Record<string, unknown> => ({
  heap_stats: 1,
  ts: uptimeMs,
  free_int: MOCK_FREE_HEAP,
  largest_int: MOCK_LARGEST_BLOCK,
  free_psram: null,
  largest_psram: null,
})

export const canStatFrame = (): Record<string, unknown> => ({
  can_stat: 1,
  fps: MOCK_FRAME_RATE,
  errors: 0,
})
