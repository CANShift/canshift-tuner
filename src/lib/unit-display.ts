import {
  displayUnit,
  signalUnitOnDash,
  type SignalDef,
  type UnitSystem,
  type Widget,
} from '@canshift/core'

export const convertibleUnitFor = (configSuffix: string, declaredUnit: string): string =>
  configSuffix === '' ? declaredUnit : ''

export const displayUnitFor = (
  configSuffix: string,
  declaredUnit: string,
  system: UnitSystem
): string => (configSuffix === '' ? displayUnit(declaredUnit, system) : configSuffix)

const configSuffixOf = (widget: Widget): string => {
  const cfg = widget.config
  if (cfg.type !== 'gauge' && cfg.type !== 'timer') return ''
  return (cfg as { suffix?: string }).suffix ?? ''
}

const declaredUnitOf = (widget: Widget, signals: readonly SignalDef[]): string => {
  if (!widget.signal) return ''
  const def = signals.find((s) => s.name === widget.signal)
  return signalUnitOnDash(widget.signal, def?.unit)
}

export interface WidgetUnit {
  symbol: string
  convertible: string
}

export const widgetUnitOf = (
  widget: Widget,
  signals: readonly SignalDef[],
  system: UnitSystem
): WidgetUnit => {
  const suffix = configSuffixOf(widget)
  const declared = declaredUnitOf(widget, signals)
  return {
    symbol: displayUnitFor(suffix, declared, system),
    convertible: convertibleUnitFor(suffix, declared),
  }
}
