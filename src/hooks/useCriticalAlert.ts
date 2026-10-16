import type { CriticalAlert, CriticalAlertDirection, SignalDef } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useDisplayUnits } from './useDisplayUnits'
import { defaultCriticalAlert } from '../lib/critical-alert'

const ENTRY_DECIMALS = 2

const roundForEntry = (value: number): number =>
  Math.round(value * 10 ** ENTRY_DECIMALS) / 10 ** ENTRY_DECIMALS

export interface CriticalAlertEditor {
  alert: CriticalAlert | undefined
  signals: readonly SignalDef[]
  unit: string
  shownFiresAt: number | null
  setSignal: (name: string) => void
  setFiresAt: (shown: number | null) => void
  setDirection: (direction: CriticalAlertDirection) => void
  turnOff: () => void
}

export const useCriticalAlert = (): CriticalAlertEditor => {
  const alert = useDashboardStore((s) => s.config?.criticalAlert)
  const setCriticalAlert = useDashboardStore((s) => s.setCriticalAlert)
  const signals = useSignalStore((s) => s.signals)
  const units = useDisplayUnits()
  const storedUnit = signals.find((s) => s.name === alert?.signal)?.unit ?? ''
  const update = (patch: Partial<CriticalAlert>) => {
    if (alert !== undefined) setCriticalAlert({ ...alert, ...patch })
  }

  return {
    alert,
    signals,
    unit: units.unitOf(storedUnit),
    shownFiresAt:
      alert === undefined ? null : roundForEntry(units.valueOf(alert.firesAt, storedUnit)),
    setSignal: (name) => {
      const signal = signals.find((s) => s.name === name)
      setCriticalAlert(signal === undefined ? null : defaultCriticalAlert(signal))
    },
    setFiresAt: (shown) => {
      if (shown !== null) update({ firesAt: units.storedValueOf(shown, storedUnit) })
    },
    setDirection: (direction) => {
      update({ direction })
    },
    turnOff: () => {
      setCriticalAlert(null)
    },
  }
}
