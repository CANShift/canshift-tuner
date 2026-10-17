import { describe, expect, it } from 'vitest'
import { BUILT_IN_ALERT_SIGNALS, type SignalDef } from '@canshift/core'
import { builtInAlertLimits, dashRulesFor } from './built-in-alerts'

const signal = (name: string, levels: Partial<SignalDef>): SignalDef =>
  ({ name, unit: 'x', ...levels }) as SignalDef

describe('dashRulesFor', () => {
  it('reads the danger level as a floor for oil pressure', () => {
    expect(dashRulesFor('oil_pressure', { dangerLevel: 1 })).toEqual([
      { direction: 'below', value: 1 },
    ])
  })

  it('reads both sides of the battery', () => {
    expect(dashRulesFor('battery_voltage', { dangerLevel: 11.5, highDangerLevel: 16 })).toEqual([
      { direction: 'below', value: 11.5 },
      { direction: 'above', value: 16 },
    ])
  })

  it('keeps the ceiling that fires first when both are above', () => {
    expect(dashRulesFor('coolant_temp', { dangerLevel: 110, highDangerLevel: 125 })).toEqual([
      { direction: 'above', value: 110 },
    ])
  })

  it('ignores the high danger level where the dash does not read it', () => {
    expect(dashRulesFor('exhaust_temp', { highDangerLevel: 1000 })).toEqual([])
    expect(dashRulesFor('gearbox_temp', { dangerLevel: 140, highDangerLevel: 150 })).toEqual([
      { direction: 'above', value: 140 },
    ])
  })
})

describe('builtInAlertLimits', () => {
  it('lists every built-in source in the dash order', () => {
    const limits = builtInAlertLimits([])
    expect(limits.map((limit) => limit.signal)).toEqual(Object.values(BUILT_IN_ALERT_SIGNALS))
    expect(limits.every((limit) => limit.rules.length === 0)).toBe(true)
  })

  it('takes the unit and levels from the car signal', () => {
    const [oil] = builtInAlertLimits([signal('oil_press_bar', { unit: 'bar', dangerLevel: 1 })])
    expect(oil).toEqual({
      source: 'oil_pressure',
      signal: 'oil_press_bar',
      unit: 'bar',
      rules: [{ direction: 'below', value: 1 }],
    })
  })
})
