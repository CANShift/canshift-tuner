import type { GaugeWidgetConfig, Widget } from '@canshift/core'
import { GAUGE_ARC, gaugeArcPath, isValueInDanger } from '@canshift/core'

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

export const isGaugeInDanger = (
  cfg: GaugeWidgetConfig,
  testValue: number | null | undefined
): boolean => {
  const { raw } = effectiveValue(testValue, cfg.minValue, cfg.maxValue)
  return isValueInDanger(raw, cfg.dangerLevel, cfg.dangerBelow)
}

export const isDangerState = (widget: Widget, testValue: number | null | undefined): boolean =>
  widget.config.type === 'gauge' && isGaugeInDanger(widget.config, testValue)

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
