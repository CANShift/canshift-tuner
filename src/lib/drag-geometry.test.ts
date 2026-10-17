import { describe, expect, it } from 'vitest'
import type { DisplayTier, Widget } from '@canshift/core'
import { dragDelta, draggedSet, leftStart, placeDragged, resizedSpan } from './drag-geometry'

const TIER = { columns: 12, rows: 6 } as DisplayTier
const PITCH = { col: 10, row: 20 }

const widget = (id: string, col: number, row: number, colSpan = 4, rowSpan = 2): Widget =>
  ({ id, layout: { col, colSpan, row, rowSpan, zOrder: 0 } }) as unknown as Widget

const A = widget('a', 0, 0)
const B = widget('b', 6, 3)

describe('draggedSet', () => {
  it('drags the grabbed widget alone when it is not part of a multi-selection', () => {
    expect(draggedSet(A, [A, B], ['b'])).toMatchObject({ isMulti: false, widgets: [{ id: 'a' }] })
  })

  it('drags every selected widget when the grabbed one is selected with others', () => {
    const set = draggedSet(A, [A, B], ['a', 'b'])
    expect(set.isMulti).toBe(true)
    expect(set.widgets.map((w) => w.id)).toEqual(['a', 'b'])
  })
})

describe('dragDelta', () => {
  it('rounds pointer travel to whole tracks for a single widget', () => {
    const single = draggedSet(A, [A], [])
    expect(dragDelta({ dx: 26, dy: -31 }, PITCH, single, TIER)).toEqual({ cols: 3, rows: -2 })
  })

  it('clamps a group so no member leaves the grid', () => {
    const group = draggedSet(A, [A, B], ['a', 'b'])
    const delta = dragDelta({ dx: -50, dy: 200 }, PITCH, group, TIER)
    expect(delta.cols).toBeCloseTo(0)
    expect(delta.rows).toBe(1)
  })
})

describe('placeDragged and leftStart', () => {
  it('clamps each placement into the grid and notices movement', () => {
    const { widgets } = draggedSet(B, [B], [])
    const placed = placeDragged(widgets, { cols: 10, rows: 0 }, TIER)
    expect(placed).toEqual([{ id: 'b', col: 8, row: 3 }])
    expect(leftStart(placed, widgets)).toBe(true)
    expect(leftStart(placeDragged(widgets, { cols: 0, rows: 0 }, TIER), widgets)).toBe(false)
  })
})

describe('resizedSpan', () => {
  it('keeps the span between one track and the right edge', () => {
    expect(resizedSpan(4, 6, 2, 12)).toBe(6)
    expect(resizedSpan(4, 6, 9, 12)).toBe(6)
    expect(resizedSpan(4, 6, -9, 12)).toBe(1)
  })
})
