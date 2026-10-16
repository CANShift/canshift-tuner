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
