import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import type { DashboardConfig } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'
import { DEFAULT_SIM_SIGNALS } from '../config/default-sim-signals'
import { fitReading, unfitWidgets } from './value-fit'

const signals = DEFAULT_SIM_SIGNALS

const withGauge = (
  widgetId: string,
  patch: Record<string, number | string>,
  base: DashboardConfig = DEFAULT_SIM_CONFIG
): DashboardConfig =>
  produce(base, (c) => {
    const widget = c.pages.flatMap((page) => page.widgets).find((w) => w.id === widgetId)
    if (widget?.config.type === 'gauge') Object.assign(widget.config, patch)
  })

const imperial = (config: DashboardConfig): DashboardConfig =>
  produce(config, (c) => {
    c.units = 'imperial'
  })

const summary = (config: DashboardConfig) =>
  unfitWidgets(config, signals).map(({ page, widget, fit }) => ({
    page: page.id,
    widget: widget.id,
    reading: fit.reading,
    unit: fit.unit,
    neededPx: fit.neededPx,
    availablePx: fit.availablePx,
  }))

describe('unfitWidgets', () => {
  it('finds nothing on the shipped pages', () => {
    expect(summary(DEFAULT_SIM_CONFIG)).toEqual([])
  })

  it('flags Track BOOST at two decimals with the numbers the dash logs', () => {
    expect(summary(withGauge('track_boost', { decimalPlaces: 2 }))).toEqual([
      {
        page: 'track',
        widget: 'track_boost',
        reading: '3.00',
        unit: 'bar',
        neededPx: 67,
        availablePx: 64,
      },
    ])
  })
})

describe('unfitWidgets units', () => {
  it('fits the shipped pages in imperial too', () => {
    expect(summary(imperial(DEFAULT_SIM_CONFIG))).toEqual([])
  })

  it('measures the reading in the unit system the dash shows', () => {
    expect(summary(imperial(withGauge('track_boost', { decimalPlaces: 2 })))).toEqual([
      {
        page: 'track',
        widget: 'track_boost',
        reading: '43.5',
        unit: 'psi',
        neededPx: 67,
        availablePx: 64,
      },
    ])
  })

  it('reads a configured suffix as the unit', () => {
    const wide = withGauge('track_water', { maxValue: 9999, suffix: 'deg' })
    expect(summary(wide)).toMatchObject([{ widget: 'track_water', reading: '9999', unit: 'deg' }])
  })

  it('returns nothing without a config', () => {
    expect(unfitWidgets(null, signals)).toEqual([])
  })
})

const asWideKnock = (config: DashboardConfig, widgetId: string): DashboardConfig =>
  produce(config, (c) => {
    const widget = c.pages.flatMap((page) => page.widgets).find((w) => w.id === widgetId)
    if (widget?.config.type !== 'gauge') return
    widget.signal = 'knock_count'
    widget.layout = { ...widget.layout, col: 0, colSpan: 4, row: 8, rowSpan: 4 }
    Object.assign(widget.config, { minValue: 0, maxValue: 99999, decimalPlaces: 0 })
    delete widget.config.big
  })

describe('unfitWidgets on the dash band', () => {
  it('measures a shift-light page with the shorter rows the dash gives it', () => {
    const config = asWideKnock(asWideKnock(DEFAULT_SIM_CONFIG, 'track_oilp'), 'engine_gearbox')
    expect(summary(config)).toEqual([
      {
        page: 'track',
        widget: 'track_oilp',
        reading: '99999',
        unit: '',
        neededPx: 91,
        availablePx: 89,
      },
    ])
  })

  it('falls back to the unit the dash draws when no car is chosen', () => {
    const config = withGauge('track_boost', { decimalPlaces: 2 })
    expect(unfitWidgets(config, []).map(({ fit }) => fitReading(fit))).toEqual(['3.00 bar'])
  })
})
