import { describe, expect, it } from 'vitest'
import type { GaugeWidgetConfig, Widget } from '@canshift/core'
import { isDangerState, isGaugeInDanger } from './gauge-math'

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

describe('when a gauge preview reads as danger', () => {
  it('flags a high-side gauge at and above its level', () => {
    expect(isGaugeInDanger(coolant, 104)).toBe(false)
    expect(isGaugeInDanger(coolant, 105)).toBe(true)
    expect(isGaugeInDanger(coolant, 130)).toBe(true)
  })

  it('flags a low-side gauge at and below its level', () => {
    expect(isGaugeInDanger(oilPressure, 5.2)).toBe(false)
    expect(isGaugeInDanger(oilPressure, 1.5)).toBe(true)
    expect(isGaugeInDanger(oilPressure, 0.4)).toBe(true)
  })

  it('judges the demo value on the side the gauge declares', () => {
    expect(isGaugeInDanger(oilPressure, null)).toBe(false)
    expect(isGaugeInDanger({ ...oilPressure, dangerLevel: 6 }, null)).toBe(true)
  })

  it('never flags a widget that is not a gauge', () => {
    expect(isDangerState(widgetWith({ type: 'gear' } as Widget['config']), 0)).toBe(false)
    expect(isDangerState(widgetWith(oilPressure), 0.4)).toBe(true)
  })
})
