import {
  DEFAULT_UNIT_SYSTEM,
  measureGaugeFit,
  resolveScreenProfile,
  type DashboardConfig,
  type GaugeWidgetConfig,
  type PageConfig,
  type SignalDef,
  type UnitSystem,
  type ValueFit,
  type Widget,
} from '@canshift/core'
import { widgetRectOn } from './page-rect'
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
  page: PageConfig
  signals: readonly SignalDef[]
  system: UnitSystem
}

const gaugeConfigOf = (widget: Widget): GaugeWidgetConfig | null =>
  widget.config.type === 'gauge' ? widget.config : null

const widgetFit = (widget: Widget, ctx: FitContext): ValueFit | null => {
  const cfg = gaugeConfigOf(widget)
  if (cfg === null) return null
  const rect = widgetRectOn(ctx.page, widget, ctx.area)
  const unit = widgetUnitOf(widget, ctx.signals, ctx.system)
  return measureGaugeFit({
    config: cfg,
    width: rect.w,
    height: rect.h,
    convertibleUnit: unit.convertible,
    unitSymbol: unit.symbol,
    system: ctx.system,
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
    page,
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
