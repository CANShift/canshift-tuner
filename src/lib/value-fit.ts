import {
  DEFAULT_UNIT_SYSTEM,
  displayValue,
  gaugeDeviceValuePx,
  measureValueFit,
  resolveGridRect,
  resolveScreenProfile,
  widestConfiguredValue,
  type DashboardConfig,
  type GaugeWidgetConfig,
  type PageConfig,
  type SignalDef,
  type UnitSystem,
  type ValueFit,
  type Widget,
} from '@canshift/core'
import { widgetUnitOf } from './unit-display'

export interface UnfitWidget {
  page: PageConfig
  widget: Widget
  fit: ValueFit
}

interface GridArea {
  width: number
  height: number
}

interface FitContext {
  area: GridArea
  signals: readonly SignalDef[]
  system: UnitSystem
}

const gaugeConfigOf = (widget: Widget): GaugeWidgetConfig | null =>
  widget.config.type === 'gauge' ? widget.config : null

const widgetFit = (widget: Widget, ctx: FitContext): ValueFit | null => {
  const cfg = gaugeConfigOf(widget)
  if (cfg === null) return null
  const rect = resolveGridRect(widget.layout, ctx.area)
  const unit = widgetUnitOf(widget, ctx.signals, ctx.system)
  const widest = widestConfiguredValue(cfg.minValue, cfg.maxValue)
  return measureValueFit({
    widestValue: displayValue(widest, unit.convertible, ctx.system),
    decimalPlaces: cfg.decimalPlaces,
    prefix: cfg.prefix ?? '',
    unit: unit.symbol,
    valueFontPx: gaugeDeviceValuePx(cfg, rect.w, rect.h),
    columnWidth: rect.w,
  })
}

const pageArea = (config: DashboardConfig, page: PageConfig): GridArea => {
  const screen = resolveScreenProfile(config.targetProfile)
  const topBarHeight = page.showTopBar === false ? 0 : config.topBar.height
  return { width: screen.width, height: screen.height - topBarHeight }
}

const pageUnfit = (
  config: DashboardConfig,
  page: PageConfig,
  signals: readonly SignalDef[]
): UnfitWidget[] => {
  const ctx = {
    area: pageArea(config, page),
    signals,
    system: config.units ?? DEFAULT_UNIT_SYSTEM,
  }
  return page.widgets.flatMap((widget) => {
    const fit = widgetFit(widget, ctx)
    return fit === null || fit.fits ? [] : [{ page, widget, fit }]
  })
}

export const unfitWidgets = (
  config: DashboardConfig | null,
  signals: readonly SignalDef[]
): UnfitWidget[] => {
  if (config === null) return []
  return config.pages.flatMap((page) => pageUnfit(config, page, signals))
}

export const fitReading = (fit: ValueFit): string => `${fit.reading} ${fit.unit}`.trim()
