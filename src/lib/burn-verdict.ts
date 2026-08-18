import type { DashboardConfig } from '@canshift/core'
import { unboundWidgetCount } from '../utils/unbound-widgets'
import { describeLayoutOverflow } from './layout-overflow'

export type BurnVerdict =
  | { kind: 'ready' }
  | { kind: 'no-device' }
  | { kind: 'no-config' }
  | { kind: 'firmware-mismatch' }
  | { kind: 'out-of-bounds'; pageId: string }
  | { kind: 'unbound'; count: number }
  | { kind: 'clean' }

export interface BurnInputs {
  hasDevice: boolean
  simulation: boolean
  firmwareMismatch: boolean
  config: DashboardConfig | null
  isDirty: boolean
}

const LABELS: Record<BurnVerdict['kind'], (verdict: BurnVerdict) => string> = {
  ready: () => 'BURN',
  clean: () => 'BURN',
  'no-device': () => 'NO DEVICE',
  'no-config': () => 'NO CONFIG',
  'firmware-mismatch': () => 'FW MISMATCH',
  'out-of-bounds': () => 'OUT OF BOUNDS',
  unbound: (verdict) => (verdict.kind === 'unbound' ? `${String(verdict.count)} UNBOUND` : ''),
}

export type ConfigVerdict =
  { kind: 'ok' } | { kind: 'out-of-bounds'; pageId: string } | { kind: 'unbound'; count: number }

export const configVerdict = (config: DashboardConfig | null): ConfigVerdict => {
  if (config === null) return { kind: 'ok' }
  const overflow = describeLayoutOverflow(config)
  if (overflow !== null) return { kind: 'out-of-bounds', pageId: overflow.pageId }
  const unbound = unboundWidgetCount(config)
  if (unbound > 0) return { kind: 'unbound', count: unbound }
  return { kind: 'ok' }
}

export const burnVerdict = (inputs: BurnInputs): BurnVerdict => {
  if (!inputs.hasDevice || inputs.simulation) return { kind: 'no-device' }
  if (inputs.config === null) return { kind: 'no-config' }
  if (inputs.firmwareMismatch) return { kind: 'firmware-mismatch' }

  const config = configVerdict(inputs.config)
  if (config.kind !== 'ok') return config

  return inputs.isDirty ? { kind: 'ready' } : { kind: 'clean' }
}

const TITLES: Record<BurnVerdict['kind'], (verdict: BurnVerdict) => string> = {
  ready: () => 'Write this config to the dash',
  clean: () => 'Nothing has changed since the last burn',
  'no-device': () => 'Plug a dash in — burning is disabled without a board',
  'no-config': () => 'Open or start a config first',
  'firmware-mismatch': () => 'The board runs a firmware this Tuner cannot write to',
  'out-of-bounds': () => 'A widget is past the panel — fix the layout before burning',
  unbound: (verdict) =>
    verdict.kind === 'unbound'
      ? `${String(verdict.count)} widget${verdict.count === 1 ? '' : 's'} would render nothing on the dash`
      : '',
}

export const burnLabel = (verdict: BurnVerdict): string => LABELS[verdict.kind](verdict)

export const burnTitle = (verdict: BurnVerdict): string => TITLES[verdict.kind](verdict)

export const burnBlocks = (verdict: BurnVerdict): boolean => verdict.kind !== 'ready'
