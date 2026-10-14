import type { Widget } from '@canshift/core'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useSignalStore } from '../../../stores/signal.store'
import { useDisplayUnits } from '../../../hooks/useDisplayUnits'

const ENTRY_DECIMALS = 2

const roundForEntry = (value: number): number =>
  Math.round(value * 10 ** ENTRY_DECIMALS) / 10 ** ENTRY_DECIMALS

export interface DangerThreshold {
  at: number | null
  below: boolean
  editable: boolean
  setAt: (value: number | null) => void
  setBelow: (below: boolean) => void
}

const useSignalUnit = (signal: string): string =>
  useSignalStore((s) => s.signals.find((candidate) => candidate.name === signal)?.unit ?? '')

export const useDangerThreshold = (pageId: string, widget: Widget): DangerThreshold => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const units = useDisplayUnits()
  const unit = useSignalUnit(widget.signal)
  const config = widget.config
  const gauge = config.type === 'gauge' ? config : null

  return {
    at: gauge === null ? null : roundForEntry(units.valueOf(gauge.dangerLevel, unit)),
    below: gauge?.dangerBelow === true,
    editable: gauge !== null,
    setAt: (value) => {
      if (gauge === null || value === null) return
      updateWidget(pageId, widget.id, {
        config: { ...gauge, dangerLevel: units.storedValueOf(value, unit) },
      })
    },
    setBelow: (below) => {
      if (gauge === null) return
      updateWidget(pageId, widget.id, { config: { ...gauge, dangerBelow: below } })
    },
  }
}
