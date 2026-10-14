import { describe, expect, it } from 'vitest'
import { TIMER_SOURCES } from '@canshift/core'
import {
  isTouchInteractive,
  timerDemoValue,
  timerKicker,
  TIMER_SOURCE_LABELS,
} from './timer-source'

describe('timerKicker', () => {
  it('derives the kicker from the source, as the device does', () => {
    expect(timerKicker('elapsed')).toBe('TIMER')
    expect(timerKicker('lap')).toBe('LAP')
    expect(timerKicker('best')).toBe('BEST')
    expect(timerKicker('last')).toBe('LAST')
    expect(timerKicker('lapCount')).toBe('LAPS')
    expect(timerKicker('delta')).toBe('DELTA')
  })

  it('treats a config with no source as the elapsed timer', () => {
    expect(timerKicker(undefined)).toBe('TIMER')
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
      expect(timerKicker(source)).toBeTruthy()
    }
  })
})
