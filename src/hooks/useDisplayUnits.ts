import { useCallback, useMemo } from 'react'
import {
  DEFAULT_UNIT_SYSTEM,
  canonicalValue,
  displayUnit,
  displayValue,
  hasUnitPair,
  type UnitSystem,
} from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'

export interface DisplayUnits {
  system: UnitSystem
  setSystem: (system: UnitSystem) => void
  unitOf: (signalUnit: string) => string
  valueOf: (value: number, signalUnit: string) => number
  storedValueOf: (shown: number, signalUnit: string) => number
  hasPair: (signalUnit: string) => boolean
}

export const useDisplayUnits = (): DisplayUnits => {
  const system = useDashboardStore((s) => s.config?.units) ?? DEFAULT_UNIT_SYSTEM
  const setSystem = useDashboardStore((s) => s.setUnits)

  const unitOf = useCallback((signalUnit: string) => displayUnit(signalUnit, system), [system])
  const valueOf = useCallback(
    (value: number, signalUnit: string) => displayValue(value, signalUnit, system),
    [system]
  )
  const storedValueOf = useCallback(
    (shown: number, signalUnit: string) => canonicalValue(shown, signalUnit, system),
    [system]
  )

  return useMemo(
    () => ({ system, setSystem, unitOf, valueOf, storedValueOf, hasPair: hasUnitPair }),
    [system, setSystem, unitOf, valueOf, storedValueOf]
  )
}
