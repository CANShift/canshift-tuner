import type { Widget } from '@canshift/core'
import { GAUGE_ARC, VALUE_FRAC_FONT_RATIO, gaugeArcPath, ratioScale } from '@canshift/core'
import { thresholdPct } from '../widgetPreview.styles'

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

export const isDangerState = (widget: Widget, testValue: number | null | undefined): boolean => {
  const cfg = widget.config
  if (cfg.type === 'gauge') {
    const { pct } = effectiveValue(testValue, cfg.minValue, cfg.maxValue)
    const dangerPct = thresholdPct(cfg.dangerLevel, cfg.minValue, cfg.maxValue)
    return pct >= dangerPct
  }
  return false
}

export const splitDecimal = (s: string): { int: string; frac: string } => {
  const dot = s.indexOf('.')
  if (dot < 0) return { int: s, frac: '' }
  return { int: s.slice(0, dot), frac: s.slice(dot) }
}

export const FRAC_FONT_SCALE = ratioScale(VALUE_FRAC_FONT_RATIO)

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
