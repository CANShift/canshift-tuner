import { describe, expect, it } from 'vitest'
import type { SignalDef, Widget } from '@canshift/core'
import { dayModeStyle, signalPatch } from './widget-editor-panel'

const gauge = {
  type: 'gauge',
  config: { type: 'gauge', minValue: 0, maxValue: 1, dangerLevel: 1 },
  style: {},
} as unknown as Widget
const rpm = { name: 'rpm', unit: 'rpm', min: 0, max: 8000, dangerLevel: 7000 } as SignalDef

describe('signalPatch', () => {
  it('copies the range, unit and danger level of the new signal into a gauge', () => {
    expect(signalPatch(gauge, rpm, 'rpm')).toEqual({
      signal: 'rpm',
      config: { type: 'gauge', minValue: 0, maxValue: 8000, dangerLevel: 7000, suffix: 'rpm' },
    })
  })

  it('only rebinds the signal for other widgets or an unknown signal', () => {
    expect(signalPatch(gauge, undefined, 'x')).toEqual({ signal: 'x' })
  })
})

describe('dayModeStyle', () => {
  it('drops the override to follow day mode and pins it otherwise', () => {
    const style = { respectDayMode: false, textColor: '#FFFFFF' } as Widget['style']
    expect(dayModeStyle(style, true)).toEqual({ textColor: '#FFFFFF' })
    expect(dayModeStyle(style, false)).toEqual({ textColor: '#FFFFFF', respectDayMode: false })
  })
})
