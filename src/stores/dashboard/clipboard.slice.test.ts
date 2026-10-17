import { beforeEach, describe, expect, it } from 'vitest'
import type { DashboardConfig, Widget } from '@canshift/core'
import { useDashboardStore } from '../dashboard.store'

const gauge = (id: string, col: number, row: number, colSpan = 2): Widget =>
  ({
    id,
    type: 'gauge',
    signal: id === 'a' ? 'rpm' : '',
    layout: { col, colSpan, row, rowSpan: 2, zOrder: 0 },
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
        widgets: [gauge('a', 0, 0), gauge('b', 4, 2), gauge('c', 9, 4)],
      },
    ],
  }) as unknown as DashboardConfig

const store = () => useDashboardStore.getState()
const widgets = (): Widget[] => store().config?.pages[0]?.widgets ?? []
const lastLabel = () => store().past[store().past.length - 1]?.label

beforeEach(() => {
  store().setConfig(makeConfig())
  store().selectWidget(null)
})

describe('copy and paste', () => {
  it('pastes a copy at the first free spot near the original and selects it', () => {
    store().copyWidgets('p1', ['a'])
    store().pasteWidgets('p1')
    const copy = widgets()[3]
    expect(copy?.layout).toMatchObject({ col: 0, row: 2 })
    expect(store().selectedWidgetIds).toEqual([copy?.id])
    expect(lastLabel()).toBe('Pasted 1 widget')
  })

  it('names several pasted widgets by count, and ignores an empty clipboard', () => {
    store().copyWidgets('p1', ['a', 'b'])
    store().pasteWidgets('p1')
    expect(lastLabel()).toBe('Pasted 2 widgets')
    useDashboardStore.setState({ clipboardWidgets: [] })
    const before = widgets().length
    store().pasteWidgets('p1')
    expect(widgets()).toHaveLength(before)
  })
})

describe('remove', () => {
  it('removes several widgets and clears them from the selection', () => {
    store().toggleWidgetSelection('a')
    store().toggleWidgetSelection('b')
    store().removeWidgets('p1', ['a', 'b'])
    expect(widgets().map((w) => w.id)).toEqual(['c'])
    expect(store().selectedWidgetIds).toEqual([])
    expect(lastLabel()).toBe('Deleted 2 widgets')
  })
})
