import type { Draft } from 'immer'
import type { DashboardConfig, PageConfig, PageTemplate, TopBarItem } from '@canshift/core'
import { withStatusItem, type StatusSlot } from '../../lib/status-row'
import { pageRef, pushHistory } from './helpers'
import type { DashboardDraft } from './widget-actions'
import type { PagesSlice, SliceCreator } from './types'

const indexOf = (config: Draft<DashboardConfig>, pageId: string): number =>
  config.pages.findIndex((page) => page.id === pageId)

const refOrPage = (index: number): string => (index === -1 ? 'page' : pageRef(index))

const addPageTo = (s: DashboardDraft, page: PageConfig): void => {
  if (!s.config) return
  pushHistory(s, `Added ${pageRef(s.config.pages.length)}`)
  s.config.pages.push(page)
  s.selectedPageId = page.id
}

const removePageFrom = (s: DashboardDraft, pageId: string): void => {
  if (!s.config) return
  pushHistory(s, `Deleted ${refOrPage(indexOf(s.config, pageId))}`)
  s.config.pages = s.config.pages.filter((page) => page.id !== pageId)
  if (s.config.defaultPageId === pageId) s.config.defaultPageId = s.config.pages[0]?.id ?? ''
  if (s.selectedPageId === pageId) s.selectedPageId = s.config.pages[0]?.id ?? null
}

const replacePage = (
  s: DashboardDraft,
  pageId: string,
  label: (ref: string) => string,
  next: (page: PageConfig) => PageConfig
): void => {
  const index = s.config ? indexOf(s.config, pageId) : -1
  const existing = s.config?.pages[index]
  if (!s.config || !existing) return
  pushHistory(s, label(pageRef(index)))
  s.config.pages[index] = next(existing)
}

const withTemplate = (page: PageConfig, template: PageTemplate): PageConfig => {
  if (template !== 'custom') return { ...page, template }
  const { template: _dropped, ...rest } = page
  return rest
}

const setPageTemplateIn = (s: DashboardDraft, pageId: string, template: PageTemplate): void =>
  replacePage(
    s,
    pageId,
    (ref) => `Changed ${ref} template`,
    (page) => withTemplate(page, template)
  )

const setStatusItemIn = (
  s: DashboardDraft,
  pageId: string,
  slot: StatusSlot,
  item: TopBarItem | null
): void =>
  replacePage(
    s,
    pageId,
    (ref) => `Changed ${ref} status row`,
    (page) => withStatusItem(page, slot, item)
  )

const movePageIn = (s: DashboardDraft, fromIndex: number, toIndex: number): void => {
  if (!s.config) return
  pushHistory(s, 'Reordered pages')
  const pages = s.config.pages
  const inRange = (index: number) => index >= 0 && index < pages.length
  if (!inRange(fromIndex) || !inRange(toIndex)) return
  const [moved] = pages.splice(fromIndex, 1)
  if (moved) pages.splice(toIndex, 0, moved)
}

export const createPagesSlice: SliceCreator<PagesSlice> = (set) => ({
  addPage: (page) => set((s) => addPageTo(s, page)),
  removePage: (pageId) => set((s) => removePageFrom(s, pageId)),
  setPageTemplate: (pageId, template) => set((s) => setPageTemplateIn(s, pageId, template)),
  movePage: (fromIndex, toIndex) => set((s) => movePageIn(s, fromIndex, toIndex)),
  setStatusItem: (pageId, slot, item) => set((s) => setStatusItemIn(s, pageId, slot, item)),
})
