import type { GaugeSeverity, GaugeWidgetConfig, SignalLimits, Widget } from '@canshift/core'
import { GAUGE_ARC, WIDGET_ZONE_COLORS, gaugeArcPath, gaugeSeverity } from '@canshift/core'

export const DEMO_PCT = 0.65

export const effectiveValue = (
  testValue: number | null | undefined,
  min: number,
  max: number
): { pct: number; raw: number } => {
  const range = max - min || 1
  if (testValue == null || !Number.isFinite(testValue)) {
    return { pct: DEMO_PCT, raw: min + range * DEMO_PCT }
  }
  const pct = Math.max(0, Math.min(1, (testValue - min) / range))
  return { pct, raw: testValue }
}

export const shownValue = (
  testValue: number | null | undefined,
  min: number,
  max: number,
  toDisplay: (value: number) => number
): { pct: number; raw: number } => {
  const shown = testValue == null || !Number.isFinite(testValue) ? testValue : toDisplay(testValue)
  return effectiveValue(shown, toDisplay(min), toDisplay(max))
}

export const gaugePreviewSeverity = (
  cfg: GaugeWidgetConfig,
  testValue: number | null | undefined,
  signal?: SignalLimits
): GaugeSeverity => {
  const { raw } = effectiveValue(testValue, cfg.minValue, cfg.maxValue)
  return gaugeSeverity(raw, cfg, signal)
}

export const widgetSeverity = (
  widget: Widget,
  testValue: number | null | undefined,
  signal?: SignalLimits
): GaugeSeverity =>
  widget.config.type === 'gauge' ? gaugePreviewSeverity(widget.config, testValue, signal) : 'normal'

export const severityInk = (
  severity: GaugeSeverity,
  normalInk: string,
  dangerInk: string
): string => ({ normal: normalInk, warn: WIDGET_ZONE_COLORS.warning, danger: dangerInk })[severity]

export const gaugeArcD = (
  cx: number,
  cy: number,
  r: number,
  fromPct: number,
  toPct: number
): string =>
  gaugeArcPath(
    cx,
    cy,
    r,
    GAUGE_ARC.rotationDeg + fromPct * GAUGE_ARC.sweepDeg,
    GAUGE_ARC.rotationDeg + toPct * GAUGE_ARC.sweepDeg
  )
