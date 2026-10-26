import type { DashboardConfig } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { sameValue } from './setup-path'

export type DashComparison =
  'identical' | 'projectNewer' | 'deviceNewer' | 'differentProject' | 'deviceEmpty'

export type ShownComparison = Exclude<DashComparison, 'identical'>

export const untouched = (
  draft: DashboardConfig | null,
  baseline: DashboardConfig | null
): boolean => draft === null || sameValue(draft, baseline ?? DEFAULT_SIM_CONFIG)

export const compareDash = (
  device: DashboardConfig | null,
  draft: DashboardConfig | null,
  baseline: DashboardConfig | null
): DashComparison => {
  if (device === null) return 'deviceEmpty'
  if (sameValue(device, draft)) return 'identical'
  if (untouched(draft, baseline)) return 'deviceNewer'
  if (baseline !== null && sameValue(device, baseline)) return 'projectNewer'
  return 'differentProject'
}
