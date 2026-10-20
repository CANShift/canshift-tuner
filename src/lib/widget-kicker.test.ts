import { describe, expect, it } from 'vitest'
import type { Widget } from '@canshift/core'
import { carriesKicker, shownKicker, withKicker } from './widget-kicker'

const widget = (signal: string, config: Record<string, unknown>): Widget =>
  ({ id: 'w', type: config.type, signal, config }) as unknown as Widget

describe('widget kicker', () => {
  it('is carried by gauges, gears, buttons and g-meters only', () => {
    expect(carriesKicker(widget('rpm', { type: 'gauge' }))).toBe(true)
    expect(carriesKicker(widget('gear', { type: 'gear' }))).toBe(true)
    expect(carriesKicker(widget('', { type: 'button' }))).toBe(true)
    expect(carriesKicker(widget('', { type: 'g_meter' }))).toBe(true)
    expect(carriesKicker(widget('', { type: 'timer' }))).toBe(false)
    expect(carriesKicker(widget('flag_mil', { type: 'warning' }))).toBe(false)
  })

  it('names a g-meter G unless it is given a kicker', () => {
    expect(shownKicker(widget('', { type: 'g_meter' }))).toBe('G')
    expect(shownKicker(widget('', { type: 'g_meter', kicker: 'grip' }))).toBe('GRIP')
  })

  it('shows the authored kicker uppercased, the dash label otherwise', () => {
    expect(shownKicker(widget('coolant_temp_c', { type: 'gauge', kicker: 'h2o' }))).toBe('H2O')
    expect(shownKicker(widget('coolant_temp_c', { type: 'gauge' }))).toBe('WATER')
  })

  it('writes a kicker and drops it again when cleared', () => {
    const gauge = widget('rpm', { type: 'gauge', dangerLevel: 7000 })
    expect(withKicker(gauge, 'REVS')).toEqual({ type: 'gauge', dangerLevel: 7000, kicker: 'REVS' })
    const named = widget('rpm', { type: 'gauge', dangerLevel: 7000, kicker: 'REVS' })
    expect(withKicker(named, '')).toEqual({ type: 'gauge', dangerLevel: 7000 })
  })

  it('refuses a widget that draws no kicker', () => {
    expect(withKicker(widget('', { type: 'timer' }), 'LAP')).toBeNull()
  })
})
