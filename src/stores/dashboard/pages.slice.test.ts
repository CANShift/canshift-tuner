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

const cloneOf = () => {
  store().setConfig(makeConfig())
  store().duplicatePage('p1')
  return store().config?.pages ?? []
}

describe('duplicatePage (#1652)', () => {
  it('inserts the clone right after the original', () => {
    const pages = cloneOf()
    expect(pages.map((page) => page.id)).toEqual(['p1', pages[1]?.id, 'p2'])
    expect(pages[1]?.id).not.toBe('p1')
    expect(store().selectedPageId).toBe(pages[1]?.id)
  })

  it('gives the clone fresh, unique widget ids', () => {
    const pages = cloneOf()

    const clone = pages[1]
    const originalIds = pages[0]?.widgets.map((w) => w.id) ?? []
    const cloneIds = clone?.widgets.map((w) => w.id) ?? []
    expect(cloneIds).toHaveLength(2)
    expect(cloneIds.some((id) => originalIds.includes(id))).toBe(false)
    expect(new Set(cloneIds).size).toBe(cloneIds.length)
  })

  it('is a no-op for an unknown pageId', () => {
    useDashboardStore.getState().setConfig(makeConfig())
    const before = useDashboardStore.getState().config?.pages.length
    useDashboardStore.getState().duplicatePage('does-not-exist')
    expect(useDashboardStore.getState().config?.pages.length).toBe(before)
  })
})

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

  it('sets the boot page and edits a page', () => {
    store().setDefaultPage('p2')
    expect(store().config?.defaultPageId).toBe('p2')
    expect(lastLabel()).toBe('Set page 02 as default')
    store().updatePage('p2', { visible: false })
    expect(store().config?.pages[1]?.visible).toBe(false)
    expect(lastLabel()).toBe('Edited page 02')
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

  it('patches the top bar', () => {
    store().updateTopBar({ height: 20 })
    expect(store().config?.topBar.height).toBe(20)
    expect(lastLabel()).toBe('Edited top bar')
  })
})
