import { beforeEach, describe, expect, it } from 'vitest'
import type { DashboardConfig, Widget } from '@canshift/core'
import { useDashboardStore } from '../dashboard.store'

const gauge = (id: string, col: number, row: number, colSpan = 4, signal = ''): Widget =>
  ({
    id,
    type: 'gauge',
    signal,
    layout: { col, colSpan, row, rowSpan: 3, zOrder: 0 },
    style: {},
    config: { type: 'gauge', dangerLevel: 100 },
  }) as unknown as Widget

const makeConfig = (): DashboardConfig =>
  ({
    version: '1.24.0',
    defaultPageId: 'p1',
    topBar: { height: 16, bgColor: '#000000', textColor: '#FFFFFF' },
    pages: [
      {
        id: 'p1',
        backgroundColor: '#000000',
        showTopBar: true,
        visible: true,
        widgets: [gauge('a', 0, 0, 4, 'rpm'), gauge('b', 4, 0)],
      },
    ],
  }) as unknown as DashboardConfig

const store = () => useDashboardStore.getState()
const widgets = (): Widget[] => store().config?.pages[0]?.widgets ?? []
const layoutOf = (id: string) => widgets().find((w) => w.id === id)?.layout
const lastLabel = (): string | undefined => store().past[store().past.length - 1]?.label

beforeEach(() => {
  store().setConfig(makeConfig())
  store().selectWidget(null)
})

describe('addWidget', () => {
  it('places a new widget beside the selected one', () => {
    store().selectWidget('b')
    store().addWidget('p1', gauge('c', 0, 0))
    expect(layoutOf('c')).toMatchObject({ col: 8, row: 0 })
    expect(store().selectedWidgetIds).toEqual(['c'])
    expect(lastLabel()).toBe('Added gauge')
  })

  it('falls back to the first free spot with nothing selected', () => {
    store().addWidget('p1', gauge('c', 0, 0))
    const placed = layoutOf('c')
    expect(placed).toBeDefined()
    expect([placed?.col, placed?.row]).not.toEqual([0, 0])
  })
})

describe('updateWidget', () => {
  it('labels a rebind, a resize and an edit differently', () => {
    store().updateWidget('p1', 'a', { signal: 'speed_kph' })
    expect(lastLabel()).toBe('Rebound rpm to speed_kph')
    store().updateWidget('p1', 'b', { signal: '' })
    expect(lastLabel()).toBe('Edited gauge')
    store().updateWidget('p1', 'b', {
      layout: { col: 4, colSpan: 2, row: 0, rowSpan: 3, zOrder: 0 },
    })
    expect(lastLabel()).toBe('Resized gauge')
  })

  it('clamps a layout that leaves the grid', () => {
    store().updateWidget('p1', 'b', {
      layout: { col: 40, colSpan: 4, row: 0, rowSpan: 3, zOrder: 0 },
    })
    const layout = layoutOf('b')
    expect((layout?.col ?? 0) + (layout?.colSpan ?? 0)).toBeLessThanOrEqual(12)
  })
})

describe('moving widgets', () => {
  it('moves live without history, one widget or several', () => {
    store().moveWidget('p1', 'b', { col: 6 })
    expect(layoutOf('b')?.col).toBe(6)
    expect(store().past).toHaveLength(0)
    store().moveWidgets('p1', [
      { id: 'a', col: 0, row: 6 },
      { id: 'b', col: 8, row: 6 },
    ])
    expect([layoutOf('a'), layoutOf('b')]).toMatchObject([
      { col: 0, row: 6 },
      { col: 8, row: 6 },
    ])
  })
})

describe('dropping and dragging widgets', () => {
  it('pushes overlapping widgets aside after a drop', () => {
    store().moveWidget('p1', 'b', { col: 0 })
    store().resolveWidgetCollisions('p1', 'b')
    const a = layoutOf('a')
    const b = layoutOf('b')
    const overlap =
      a &&
      b &&
      a.row < b.row + b.rowSpan &&
      b.row < a.row + a.rowSpan &&
      a.col < b.col + b.colSpan &&
      b.col < a.col + a.colSpan
    expect(overlap).toBe(false)
  })

  it('labels a drag by its widget or by count', () => {
    store().beginDrag('p1', ['a'])
    expect(lastLabel()).toBe('Moved rpm')
    store().beginDrag('p1', ['a', 'b'])
    expect(lastLabel()).toBe('Moved 2 widgets')
  })
})

describe('keyboard steps', () => {
  it('nudges inside the grid and labels by widget or count', () => {
    store().nudgeWidgets('p1', ['a'], { cols: -1, rows: 1 })
    expect(layoutOf('a')).toMatchObject({ col: 0, row: 1 })
    expect(lastLabel()).toBe('Nudged rpm')
    store().nudgeWidgets('p1', ['a', 'b'], { cols: 1, rows: 0 })
    expect([layoutOf('a')?.col, layoutOf('b')?.col]).toEqual([1, 5])
    expect(lastLabel()).toBe('Nudged 2 widgets')
  })

  it('resizes by one track, never below one or past the grid edge', () => {
    store().resizeWidgets('p1', ['a'], { cols: 1, rows: -1 })
    expect(layoutOf('a')).toMatchObject({ colSpan: 5, rowSpan: 2 })
    expect(lastLabel()).toBe('Resized rpm')
    for (let i = 0; i < 20; i++) store().resizeWidgets('p1', ['b'], { cols: 1, rows: -1 })
    expect(layoutOf('b')).toMatchObject({ colSpan: 8, rowSpan: 1 })
  })
})
