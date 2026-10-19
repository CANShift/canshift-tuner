import { describe, expect, it } from 'vitest'
import type { PageConfig, SignalDef } from '@canshift/core'
import { FIRMWARE_CAPS, LAYOUT_GRID, placementsOverlap } from '@canshift/core'
import { DEFAULT_SIM_SIGNALS } from '../../config/default-sim-signals'
import { splitSpan } from './car-page-bands'
import { proposeCarPages, signalsToUse } from './car-pages'

const only = (...names: string[]): SignalDef[] =>
  DEFAULT_SIM_SIGNALS.filter((def) => names.includes(def.name))

const pageOf = (signals: readonly SignalDef[], id: string): PageConfig | undefined =>
  proposeCarPages(signals).find((proposal) => proposal.id === id)?.page

const signalsOn = (page: PageConfig | undefined): string[] =>
  page?.widgets.map((widget) => widget.signal) ?? []

const rowsCovered = (page: PageConfig): number =>
  Math.max(...page.widgets.map((widget) => widget.layout.row + widget.layout.rowSpan))

const overlaps = (page: PageConfig): boolean =>
  page.widgets.some((a, i) =>
    page.widgets.slice(i + 1).some((b) => placementsOverlap(a.layout, b.layout))
  )

const STREET_SET = ['speed_kph', 'gear', 'rpm', 'coolant_temp_c', 'fuel_level_pct', 'battery_volts']

describe('splitting a span by weight', () => {
  it('keeps whole-number spans that add up to the total', () => {
    expect(splitSpan(12, [6, 3])).toEqual([8, 4])
    expect(splitSpan(12, [4, 4, 4])).toEqual([4, 4, 4])
    expect(splitSpan(11, [5, 3])).toEqual([7, 4])
  })

  it('gives nothing when there is nothing to weigh', () => {
    expect(splitSpan(12, [0, 0])).toEqual([0, 0])
  })
})

describe('the signals a page is built from', () => {
  it('uses every defined signal when nothing is coming in', () => {
    expect(signalsToUse(only('rpm', 'gear'), [])).toHaveLength(2)
  })

  it('keeps only the defined signals that are coming in', () => {
    const used = signalsToUse(only('rpm', 'gear'), ['rpm', 'boost_bar'])
    expect(used.map((def) => def.name)).toEqual(['rpm'])
  })
})

describe('pages built from a car', () => {
  it('proposes the street, track and engine pages for a well-equipped car', () => {
    expect(proposeCarPages(DEFAULT_SIM_SIGNALS).map((proposal) => proposal.id)).toEqual([
      'street',
      'track',
      'engine',
    ])
  })

  it('never places a gauge on a signal the car does not define', () => {
    const defined = new Set(STREET_SET)
    const signals = proposeCarPages(only(...STREET_SET)).flatMap((p) => signalsOn(p.page))
    expect(signals.filter((signal) => signal !== '' && !defined.has(signal))).toEqual([])
  })
})

describe('the layout of a built page', () => {
  it('fits every page on the grid, without overlaps, within the page cap', () => {
    proposeCarPages(DEFAULT_SIM_SIGNALS).forEach(({ page }) => {
      expect(page.widgets.length).toBeLessThanOrEqual(FIRMWARE_CAPS.MAX_WIDGETS_PER_PAGE)
      expect(overlaps(page)).toBe(false)
      expect(rowsCovered(page)).toBe(LAYOUT_GRID.ROWS)
    })
  })

  it('widens the neighbours of a gauge the car cannot fill', () => {
    const street = pageOf(only(...STREET_SET.filter((name) => name !== 'fuel_level_pct')), 'street')
    const rpm = street?.widgets.find((widget) => widget.signal === 'rpm')
    expect(rpm?.layout.colSpan).toBe(8)
  })

  it('gives the rows of an empty band to the others', () => {
    const engine = pageOf(
      only('coolant_temp_c', 'oil_temp_c', 'oil_press_bar', 'fuel_press_bar'),
      'engine'
    )
    expect(engine?.widgets).toHaveLength(4)
    expect(engine === undefined ? 0 : rowsCovered(engine)).toBe(LAYOUT_GRID.ROWS)
  })
})

describe('which pages a car gets', () => {
  it('skips a page without enough relevant signals', () => {
    expect(proposeCarPages(only('rpm', 'gear', 'speed_kph'))).toEqual([])
  })

  it('builds a track page only for a car that sends engine speed', () => {
    const noRpm = only('gear', 'coolant_temp_c', 'oil_temp_c', 'oil_press_bar', 'boost_bar')
    expect(pageOf(noRpm, 'track')).toBeUndefined()
  })

  it('shows each signal once, the shift light aside', () => {
    const track = pageOf(DEFAULT_SIM_SIGNALS, 'track')
    const gauges = track?.widgets.filter((widget) => widget.type !== 'shift_light') ?? []
    const shown = gauges.map((widget) => widget.signal).filter((signal) => signal !== '')
    expect(new Set(shown).size).toBe(shown.length)
    expect(track?.widgets.some((widget) => widget.type === 'timer')).toBe(true)
  })

  it('takes the gauge range from the signal', () => {
    const street = pageOf(only(...STREET_SET), 'street')
    const coolant = street?.widgets.find((widget) => widget.signal === 'coolant_temp_c')
    const def = only('coolant_temp_c')[0]
    expect(coolant?.config).toMatchObject({ minValue: def?.min, maxValue: def?.max })
  })
})
