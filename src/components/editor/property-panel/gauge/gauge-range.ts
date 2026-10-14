import type { GaugeWidgetConfig } from '@canshift/core'

export const withMin = (cfg: GaugeWidgetConfig, minValue: number): GaugeWidgetConfig => ({
  ...cfg,
  minValue,
  dangerLevel: Math.max(cfg.dangerLevel, minValue),
})

export const withMax = (cfg: GaugeWidgetConfig, maxValue: number): GaugeWidgetConfig => {
  const range = cfg.maxValue - cfg.minValue || 1
  const dangerPct = (cfg.dangerLevel - cfg.minValue) / range
  const newRange = maxValue - cfg.minValue || 1
  return { ...cfg, maxValue, dangerLevel: Math.round(cfg.minValue + dangerPct * newRange) }
}

export const withBig = (cfg: GaugeWidgetConfig, big: number): GaugeWidgetConfig => {
  if (big !== 0) return { ...cfg, big }
  const { big: _, ...rest } = cfg
  return rest
}
