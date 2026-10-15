import { describe, expect, it } from 'vitest'
import { WIDGET_ZONE_COLORS, type GaugeWidgetConfig, type Widget } from '@canshift/core'
import { gaugePreviewSeverity, severityInk, widgetSeverity } from './gauge-math'

const coolant = {
  type: 'gauge',
  minValue: 0,
  maxValue: 120,
  dangerLevel: 105,
} as GaugeWidgetConfig

const oilPressure = {
  type: 'gauge',
  minValue: 0,
  maxValue: 8,
  dangerLevel: 1.5,
  dangerBelow: true,
} as GaugeWidgetConfig

const widgetWith = (config: Widget['config']): Widget => ({ config }) as Widget

describe('which tier a gauge preview reads as', () => {
  it('flags a high-side gauge at and above its danger level', () => {
    expect(gaugePreviewSeverity(coolant, 104)).toBe('normal')
    expect(gaugePreviewSeverity(coolant, 105)).toBe('danger')
    expect(gaugePreviewSeverity(coolant, 130)).toBe('danger')
  })

  it('flags a low-side gauge at and below its danger level', () => {
    expect(gaugePreviewSeverity(oilPressure, 5.2)).toBe('normal')
    expect(gaugePreviewSeverity(oilPressure, 1.5)).toBe('danger')
    expect(gaugePreviewSeverity(oilPressure, 0.4)).toBe('danger')
  })
})

describe('how the preview colours a gauge', () => {
  it('reads amber between the widget warn level and danger', () => {
    expect(gaugePreviewSeverity({ ...coolant, warnLevel: 95 }, 100)).toBe('warn')
    expect(gaugePreviewSeverity({ ...oilPressure, warnLevel: 2 }, 1.8)).toBe('warn')
  })

  it('falls back to the catalogue warn level, as the dash does', () => {
    expect(gaugePreviewSeverity(coolant, 100, { highWarningLevel: 98 })).toBe('warn')
    expect(gaugePreviewSeverity(coolant, 100)).toBe('normal')
  })

  it('judges the demo value on the side the gauge declares', () => {
    expect(gaugePreviewSeverity(oilPressure, null)).toBe('normal')
    expect(gaugePreviewSeverity({ ...oilPressure, dangerLevel: 6 }, null)).toBe('danger')
  })

  it('never flags a widget that is not a gauge', () => {
    expect(widgetSeverity(widgetWith({ type: 'gear' } as Widget['config']), 0)).toBe('normal')
    expect(widgetSeverity(widgetWith(oilPressure), 0.4)).toBe('danger')
  })

  it('inks each tier: plain, amber, critical', () => {
    expect(severityInk('normal', '#FFFFFF', '#FF4444')).toBe('#FFFFFF')
    expect(severityInk('warn', '#FFFFFF', '#FF4444')).toBe(WIDGET_ZONE_COLORS.warning)
    expect(severityInk('danger', '#FFFFFF', '#FF4444')).toBe('#FF4444')
  })
})
