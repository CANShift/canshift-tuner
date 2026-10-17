import type { CriticalAlert, CriticalAlertDirection } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useDisplayUnits } from './useDisplayUnits'
import { defaultCriticalAlert } from '../lib/critical-alert'

const ENTRY_DECIMALS = 2
const NO_ALERTS: readonly CriticalAlert[] = []

const roundForEntry = (value: number): number =>
  Math.round(value * 10 ** ENTRY_DECIMALS) / 10 ** ENTRY_DECIMALS

export const useCriticalAlerts = (): readonly CriticalAlert[] =>
  useDashboardStore((s) => s.config?.criticalAlerts) ?? NO_ALERTS

export interface AlertDisplay {
  unit: string
  shownFiresAt: number
  toStored: (shown: number) => number
}

export const useAlertDisplay = (alert: CriticalAlert): AlertDisplay => {
  const storedUnit = useSignalStore((s) => s.signals.find((c) => c.name === alert.signal)?.unit)
  const units = useDisplayUnits()
  const unit = storedUnit ?? ''
  return {
    unit: units.unitOf(unit),
    shownFiresAt: roundForEntry(units.valueOf(alert.firesAt, unit)),
    toStored: (shown) => units.storedValueOf(shown, unit),
  }
}

export interface CriticalAlertEditor extends AlertDisplay {
  alert: CriticalAlert
  setSignal: (name: string) => void
  setFiresAt: (shown: number | null) => void
  setDirection: (direction: CriticalAlertDirection) => void
  remove: () => void
}

export const useCriticalAlertEditor = (
  index: number,
  alert: CriticalAlert
): CriticalAlertEditor => {
  const update = useDashboardStore((s) => s.updateCriticalAlert)
  const remove = useDashboardStore((s) => s.removeCriticalAlert)
  const signals = useSignalStore((s) => s.signals)
  const display = useAlertDisplay(alert)
  return {
    ...display,
    alert,
    setSignal: (name) => {
      const signal = signals.find((s) => s.name === name)
      if (signal !== undefined) update(index, defaultCriticalAlert(signal))
    },
    setFiresAt: (shown) => {
      if (shown !== null) update(index, { ...alert, firesAt: display.toStored(shown) })
    },
    setDirection: (direction) => update(index, { ...alert, direction }),
    remove: () => remove(index),
  }
}

export const useAddCriticalAlert = (): ((name: string) => void) => {
  const add = useDashboardStore((s) => s.addCriticalAlert)
  const signals = useSignalStore((s) => s.signals)
  return (name) => {
    const signal = signals.find((s) => s.name === name)
    if (signal !== undefined) add(defaultCriticalAlert(signal))
  }
}
