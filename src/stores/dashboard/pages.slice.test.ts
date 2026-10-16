import { describe, it, expect, beforeEach } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import { useDashboardStore } from '../dashboard.store'

const makeConfig = (): DashboardConfig =>
  ({
    version: '1.23.0',
    defaultPageId: 'p1',
    topBar: { height: 16, bgColor: '#000000', textColor: '#FFFFFF' },
    pages: [
      {
        id: 'p1',
        backgroundColor: '#000000',
        showTopBar: true,
        visible: true,
        widgets: [
          { id: 'gauge_a', type: 'gauge' },
          { id: 'gauge_b', type: 'gauge' },
        ],
      },
      { id: 'p2', backgroundColor: '#000000', showTopBar: true, visible: true, widgets: [] },
    ],
  }) as unknown as DashboardConfig

const store = () => useDashboardStore.getState()
const pageIds = () => store().config?.pages.map((page) => page.id) ?? []
const lastLabel = () => store().past[store().past.length - 1]?.label

describe('page edits', () => {
  beforeEach(() => {
    store().setConfig(makeConfig())
  })

  it('adds a page, selects it and labels it by position', () => {
    store().addPage({ ...makeConfig().pages[1]!, id: 'p3' })
    expect(pageIds()).toEqual(['p1', 'p2', 'p3'])
    expect(store().selectedPageId).toBe('p3')
    expect(lastLabel()).toBe('Added page 03')
  })

  it('removes the selected page and selects the first one left', () => {
    store().selectPage('p2')
    store().removePage('p2')
    expect(pageIds()).toEqual(['p1'])
    expect(store().selectedPageId).toBe('p1')
    expect(lastLabel()).toBe('Deleted page 02')
  })
})

describe('page order, templates and the top bar', () => {
  beforeEach(() => {
    store().setConfig(makeConfig())
  })

  it('reorders pages and ignores an index out of range', () => {
    store().movePage(1, 0)
    expect(pageIds()).toEqual(['p2', 'p1'])
    store().movePage(0, 5)
    expect(pageIds()).toEqual(['p2', 'p1'])
  })

  it('sets a template and drops it again for custom', () => {
    store().setPageTemplate('p1', 'track' as never)
    expect(store().config?.pages[0]?.template).toBe('track')
    store().setPageTemplate('p1', 'custom')
    expect(store().config?.pages[0]).not.toHaveProperty('template')
    expect(lastLabel()).toBe('Changed page 01 template')
  })
})

describe('removePage', () => {
  it('moves the first page to the default slot when the default page goes', () => {
    store().setConfig(makeConfig())
    store().removePage('p1')
    expect(pageIds()).toEqual(['p2'])
    expect(store().config?.defaultPageId).toBe('p2')
  })
})
