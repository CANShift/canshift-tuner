import { describe, expect, it } from 'vitest'
import { defaultCriticalAlert, describeCriticalRule, takeoverTextFor } from './critical-alert'

describe('defaultCriticalAlert', () => {
  it('fires above the high-side danger level of a rising signal', () => {
    expect(
      defaultCriticalAlert({ name: 'egt_c', max: 1200, highDangerLevel: 1000, dangerLevel: 950 })
    ).toEqual({ signal: 'egt_c', firesAt: 1000, direction: 'above', acknowledgeOn: 'dash' })
  })

  it('fires below the danger level of a falling signal', () => {
    expect(
      defaultCriticalAlert({ name: 'oil_press_bar', max: 10, warningLevel: 1.5, dangerLevel: 1 })
    ).toEqual({ signal: 'oil_press_bar', firesAt: 1, direction: 'below', acknowledgeOn: 'dash' })
  })

  it('falls back to the top of the range when the catalogue gives no level', () => {
    expect(defaultCriticalAlert({ name: 'boost_bar', max: 2.5 }).firesAt).toBe(2.5)
  })
})

describe('describeCriticalRule', () => {
  it('reads as direction, threshold and unit', () => {
    const alert = { signal: 'x', firesAt: 1, direction: 'below', acknowledgeOn: 'dash' } as const
    expect(describeCriticalRule(alert, '1.0', 'bar')).toBe('below 1.0 bar')
    expect(describeCriticalRule(alert, '1.0', '')).toBe('below 1.0')
  })
})

describe('takeoverTextFor', () => {
  it('names the signal the way the dash labels it', () => {
    const alert = {
      signal: 'oil_press_bar',
      firesAt: 1,
      direction: 'below',
      acknowledgeOn: 'dash',
    } as const
    expect(takeoverTextFor(alert, 14.5, 'psi')).toEqual({
      name: 'OIL PRESS',
      value: '14.5',
      rule: 'below 14.5 psi',
    })
  })
})
