import type { GaugeWidgetConfig, Widget } from '@canshift/core'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useSignalStore } from '../../../stores/signal.store'
import { useDisplayUnits } from '../../../hooks/useDisplayUnits'

const ENTRY_DECIMALS = 2

const roundForEntry = (value: number): number =>
  Math.round(value * 10 ** ENTRY_DECIMALS) / 10 ** ENTRY_DECIMALS

export interface GaugeThresholds {
  warnAt: number | null
  dangerAt: number | null
  below: boolean
  editable: boolean
  setWarnAt: (value: number | null) => void
  setDangerAt: (value: number | null) => void
  setBelow: (below: boolean) => void
}

const useSignalUnit = (signal: string): string =>
  useSignalStore((s) => s.signals.find((candidate) => candidate.name === signal)?.unit ?? '')

const withWarnLevel = (gauge: GaugeWidgetConfig, warnLevel: number | null): GaugeWidgetConfig => {
  const { warnLevel: _previous, ...rest } = gauge
  return warnLevel === null ? rest : { ...rest, warnLevel }
}

export const useGaugeThresholds = (pageId: string, widget: Widget): GaugeThresholds => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const units = useDisplayUnits()
  const unit = useSignalUnit(widget.signal)
  const gauge = widget.config.type === 'gauge' ? widget.config : null
  const shown = (value: number | undefined): number | null =>
    value === undefined ? null : roundForEntry(units.valueOf(value, unit))
  const write = (config: GaugeWidgetConfig) => {
    updateWidget(pageId, widget.id, { config })
  }

  return {
    warnAt: shown(gauge?.warnLevel),
    dangerAt: shown(gauge?.dangerLevel),
    below: gauge?.dangerBelow === true,
    editable: gauge !== null,
    setWarnAt: (value) => {
      if (gauge === null) return
      write(withWarnLevel(gauge, value === null ? null : units.storedValueOf(value, unit)))
    },
    setDangerAt: (value) => {
      if (gauge === null || value === null) return
      write({ ...gauge, dangerLevel: units.storedValueOf(value, unit) })
    },
    setBelow: (below) => {
      if (gauge === null) return
      write({ ...gauge, dangerBelow: below })
    },
  }
}
