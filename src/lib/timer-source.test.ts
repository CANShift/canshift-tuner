import { describe, expect, it } from 'vitest'
import { TIMER_SOURCES } from '@canshift/core'
import {
  isTouchInteractive,
  timerDemoValue,
  timerKicker,
  timerUnit,
  TIMER_SOURCE_LABELS,
} from './timer-source'

describe('timerKicker', () => {
  it('derives the kicker from the source, as the device does', () => {
    expect(timerKicker('elapsed', 'metric')).toBe('TIMER')
    expect(timerKicker('lap', 'metric')).toBe('LAP')
    expect(timerKicker('best', 'metric')).toBe('BEST')
    expect(timerKicker('last', 'metric')).toBe('LAST')
    expect(timerKicker('lapCount', 'metric')).toBe('LAPS')
    expect(timerKicker('delta', 'metric')).toBe('DELTA')
  })

  it('treats a config with no source as the elapsed timer', () => {
    expect(timerKicker(undefined, 'metric')).toBe('TIMER')
  })
})

describe('timerKicker for launch sources', () => {
  it('follows the unit system the way the dash does', () => {
    expect(timerKicker('launchSprint', 'metric')).toBe('0-100')
    expect(timerKicker('launchSprint', 'imperial')).toBe('0-60')
    expect(timerKicker('launchStrip', 'metric')).toBe('400 M')
    expect(timerKicker('launchStrip', 'imperial')).toBe('1/4 MI')
  })
})

describe('timerDemoValue', () => {
  it('follows the format only for the elapsed timer', () => {
    expect(timerDemoValue('elapsed', 'mm:ss')).toBe('01:23')
    expect(timerDemoValue('elapsed', 'ss.mmm')).toBe('12.847')
    expect(timerDemoValue('best', 'ss.mmm')).toBe('1:36.07')
  })

  it('signs the delta', () => {
    expect(timerDemoValue('delta', undefined)).toMatch(/^[+-]/)
  })
})

describe('isTouchInteractive', () => {
  it('is true only for the elapsed timer', () => {
    expect(isTouchInteractive('elapsed')).toBe(true)
    expect(isTouchInteractive(undefined)).toBe(true)
    for (const source of TIMER_SOURCES.filter((s) => s !== 'elapsed')) {
      expect(isTouchInteractive(source)).toBe(false)
    }
  })
})

describe('the source tables', () => {
  it('cover every source core declares', () => {
    for (const source of TIMER_SOURCES) {
      expect(TIMER_SOURCE_LABELS[source]).toBeTruthy()
      expect(timerKicker(source, 'metric')).toBeTruthy()
    }
  })
})

describe('timerUnit', () => {
  it('gives the delta its seconds unit, as the dash does', () => {
    expect(timerUnit('delta')).toBe('s')
  })

  it('leaves every lap time and count without a unit', () => {
    for (const source of ['elapsed', 'lap', 'best', 'last', 'lapCount', undefined] as const) {
      expect(timerUnit(source)).toBe('')
    }
  })
})
