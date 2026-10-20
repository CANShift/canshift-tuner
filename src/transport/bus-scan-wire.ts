import { z } from 'zod'

const ProbeWireSchema = z.tuple([z.number().int(), z.number().int(), z.number().int()])

const SeenIdWireSchema = z.tuple([z.number().int().nonnegative(), z.number().int().positive()])

const IdleWireSchema = z.object({ state: z.literal('idle') })

const ProgressWireSchema = z.object({
  state: z.enum(['probing', 'collecting']),
  kbps: z.number().int(),
  step: z.number().int(),
  steps: z.number().int(),
})

const DoneWireSchema = z.object({
  state: z.literal('done'),
  outcome: z.enum(['detected', 'silent', 'unclear', 'failed']),
  kbps: z.number().int(),
  window_ms: z.number().int().positive(),
  probes: z.array(ProbeWireSchema),
  ids: z.array(SeenIdWireSchema),
  truncated: z.boolean(),
})

const BusScanWireSchema = z.discriminatedUnion('state', [
  IdleWireSchema,
  ProgressWireSchema,
  DoneWireSchema,
])

type BusScanWire = z.infer<typeof BusScanWireSchema>
type DoneWire = z.infer<typeof DoneWireSchema>

export type BusScanOutcome = DoneWire['outcome']

interface BusProbe {
  kbps: number
  frames: number
  busErrors: number
}

interface SeenFrame {
  id: number
  count: number
  rateHz: number
}

export interface BusScanResult {
  outcome: BusScanOutcome
  kbps: number
  probes: readonly BusProbe[]
  frames: readonly SeenFrame[]
  truncated: boolean
}

export type BusScanReport =
  | { state: 'idle' }
  | { state: 'probing' | 'collecting'; kbps: number; step: number; steps: number }
  | { state: 'done'; result: BusScanResult }

const MS_PER_S = 1_000

const resultFromWire = (wire: DoneWire): BusScanResult => ({
  outcome: wire.outcome,
  kbps: wire.kbps,
  probes: wire.probes.map(([kbps, frames, busErrors]) => ({ kbps, frames, busErrors })),
  frames: wire.ids.map(([id, count]) => ({
    id,
    count,
    rateHz: (count * MS_PER_S) / wire.window_ms,
  })),
  truncated: wire.truncated,
})

const reportFromWire = (wire: BusScanWire): BusScanReport =>
  wire.state === 'done' ? { state: 'done', result: resultFromWire(wire) } : wire

export const parseBusScanReport = (raw: unknown): BusScanReport | null => {
  const parsed = BusScanWireSchema.safeParse(raw)
  return parsed.success ? reportFromWire(parsed.data) : null
}
