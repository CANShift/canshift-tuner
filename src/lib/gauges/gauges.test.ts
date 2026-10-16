import { describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { STARTING_LAYOUTS, freePlaceFor, nextPageId, pageFromLayout } from './layouts'
import { inReadingOrder, neighbourOf, positionOf, swappedWithNeighbour } from './reading-order'

const street = DEFAULT_SIM_CONFIG.pages[0]
if (!street) throw new Error('the demo config has a first page')

describe('reading order', () => {
  it('reads gauges row by row, left to right', () => {
    expect(
      inReadingOrder(street.widgets)
        .map((w) => w.id)
        .slice(0, 3)
    ).toEqual(['street_speed', 'street_gear', 'street_rpm'])
  })

  it('finds the gauge before and after, and none past the ends', () => {
    expect(neighbourOf(street, 'street_gear', -1)?.id).toBe('street_speed')
    expect(neighbourOf(street, 'street_speed', -1)).toBeNull()
    expect(positionOf(street, 'street_gear')).toBe(2)
  })

  it('moves a gauge right by swapping places with the next one', () => {
    const moved = swappedWithNeighbour(street, 'street_speed', 1)
    const speed = moved?.widgets.find((w) => w.id === 'street_speed')
    const gear = street.widgets.find((w) => w.id === 'street_gear')
    expect(speed?.layout.col).toBe(gear?.layout.col)
    expect(positionOf(moved ?? street, 'street_speed')).toBe(2)
  })
})

describe('starting layouts', () => {
  it('offers the reference pages', () => {
    expect(STARTING_LAYOUTS.map((layout) => layout.name)).toContain('Track')
  })

  it('numbers a page whose name is taken', () => {
    expect(nextPageId('track', new Set(['track', 'track_2']))).toBe('track_3')
  })

  it('gives every gauge of a new page a fresh id', () => {
    const [first] = STARTING_LAYOUTS
    if (!first) throw new Error('expected a layout')
    const page = pageFromLayout(first, new Set([first.page.id]))
    expect(page.id).toBe(`${first.page.id}_2`)
    expect(page.widgets.some((w) => first.page.widgets.some((o) => o.id === w.id))).toBe(false)
  })
})

describe('adding a widget', () => {
  it('finds room on a page with space left, at the size asked for first', () => {
    const blank = { ...street, widgets: [] }
    expect(freePlaceFor(blank, { colSpan: 12, rowSpan: 1 })).toEqual({
      col: 0,
      row: 0,
      colSpan: 12,
      rowSpan: 1,
    })
    expect(freePlaceFor(blank)).toEqual({ col: 0, row: 0, colSpan: 6, rowSpan: 3 })
  })

  it('never stacks a new widget on top of the others', () => {
    const place = freePlaceFor(street)
    if (place === null) return
    const overlaps = street.widgets.some(
      (w) =>
        place.col < w.layout.col + w.layout.colSpan &&
        w.layout.col < place.col + place.colSpan &&
        place.row < w.layout.row + w.layout.rowSpan &&
        w.layout.row < place.row + place.rowSpan
    )
    expect(overlaps).toBe(false)
  })
})
