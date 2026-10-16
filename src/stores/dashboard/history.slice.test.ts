import { describe, it, expect, beforeEach } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import { useDashboardStore } from '../dashboard.store'

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
        widgets: [
          {
            id: 'gauge_a',
            type: 'gauge',
            signal: '',
            layout: { col: 0, colSpan: 4, row: 0, rowSpan: 3, zOrder: 0 },
          },
          {
            id: 'gauge_b',
            type: 'gauge',
            signal: '',
            layout: { col: 4, colSpan: 4, row: 0, rowSpan: 3, zOrder: 0 },
          },
        ],
      },
      { id: 'p2', backgroundColor: '#000000', showTopBar: true, visible: true, widgets: [] },
    ],
  }) as unknown as DashboardConfig

beforeEach(() => {
  useDashboardStore.getState().setConfig(makeConfig())
})

const lastLabel = () => {
  const past = useDashboardStore.getState().past
  return past[past.length - 1]?.label
}

describe('undo/redo (#1742)', () => {
  it('starts with empty history after setConfig', () => {
    expect(useDashboardStore.getState().past).toHaveLength(0)
    expect(useDashboardStore.getState().future).toHaveLength(0)
  })
})

describe('undo/redo edges (#1742)', () => {
  it('re-points selection when the selected page no longer exists after undo', () => {
    useDashboardStore.getState().selectPage('p2')
    useDashboardStore.getState().removePage('p2')
    useDashboardStore.getState().undo()
    const state = useDashboardStore.getState()
    expect(state.config?.pages.some((p) => p.id === state.selectedPageId)).toBe(true)
  })

  it('undo is a no-op with empty history', () => {
    const before = useDashboardStore.getState().config
    useDashboardStore.getState().undo()
    expect(useDashboardStore.getState().config).toBe(before)
  })
})

describe('labelled undo stack (#1847)', () => {
  it('labels a widget deletion with the widget reference', () => {
    useDashboardStore.getState().removeWidget('p1', 'gauge_a')
    expect(lastLabel()).toBe('Deleted gauge')
  })

  it('labels a rebind with old and new signal', () => {
    useDashboardStore.getState().updateWidget('p1', 'gauge_a', { signal: 'rpm' })
    expect(lastLabel()).toBe('Rebound gauge to rpm')
  })

  it('labels page operations with the page number', () => {
    useDashboardStore.getState().removePage('p2')
    expect(lastLabel()).toBe('Deleted page 02')
  })
})
