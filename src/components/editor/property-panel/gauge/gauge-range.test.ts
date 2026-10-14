import { describe, expect, it } from 'vitest'
import type { GaugeWidgetConfig } from '@canshift/core'
import { withBig, withMax, withMin } from './gauge-range'

const cfg = {
  type: 'gauge',
  minValue: 0,
  maxValue: 100,
  dangerLevel: 80,
  big: 64,
} as GaugeWidgetConfig

describe('gauge range edits', () => {
  it('lifts the danger level when the minimum passes it', () => {
    expect(withMin(cfg, 90)).toMatchObject({ minValue: 90, dangerLevel: 90 })
    expect(withMin(cfg, 10).dangerLevel).toBe(80)
  })

  it('keeps the danger level at the same fraction of a new maximum', () => {
    expect(withMax(cfg, 200)).toMatchObject({ maxValue: 200, dangerLevel: 160 })
  })

  it('drops the big override for auto and sets it otherwise', () => {
    expect('big' in withBig(cfg, 0)).toBe(false)
    expect(withBig(cfg, 96).big).toBe(96)
  })
})
