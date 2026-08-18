import { UNIT_SYSTEMS } from '@canshift/core'
import type { UnitSystem } from '@canshift/core'

const LABELS: Record<UnitSystem, string> = {
  metric: 'Metric',
  imperial: 'Imperial',
}

export const UNIT_SYSTEM_OPTIONS = UNIT_SYSTEMS.map((value) => ({ value, label: LABELS[value] }))
