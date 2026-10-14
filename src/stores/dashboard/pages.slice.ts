import type { Draft } from 'immer'
import type { DashboardConfig, PageConfig, PageTemplate, TopBarConfig } from '@canshift/core'
import { pageRef, pushHistory } from './helpers'
import { createId } from '../../utils/id'
import type { DashboardDraft } from './widget-actions'
import type { PagesSlice, SliceCreator } from './types'

const indexOf = (config: Draft<DashboardConfig>, pageId: string): number =>
  config.pages.findIndex((page) => page.id === pageId)

const refOrPage = (index: number): string => (index === -1 ? 'page' : pageRef(index))

const cloneOf = (original: PageConfig): PageConfig => ({
  ...original,
  id: createId('page'),
  widgets: original.widgets.map((w) => ({ ...w, id: createId(w.type) })),
})

const addPageTo = (s: DashboardDraft, page: PageConfig): void => {
  if (!s.config) return
  pushHistory(s, `Added ${pageRef(s.config.pages.length)}`)
  s.config.pages.push(page)
  s.selectedPageId = page.id
  s.isDirty = true
}

const insertClone = (s: DashboardDraft, index: number, clone: PageConfig): void => {
  if (!s.config) return
  pushHistory(s, `Duplicated ${pageRef(index)}`)
  s.config.pages.splice(index + 1, 0, clone)
  s.selectedPageId = clone.id
  s.isDirty = true
}

const removePageFrom = (s: DashboardDraft, pageId: string): void => {
  if (!s.config) return
  pushHistory(s, `Deleted ${refOrPage(indexOf(s.config, pageId))}`)
  s.config.pages = s.config.pages.filter((page) => page.id !== pageId)
  if (s.selectedPageId === pageId) s.selectedPageId = s.config.pages[0]?.id ?? null
  s.isDirty = true
}

const setDefaultPageIn = (s: DashboardDraft, pageId: string): void => {
  if (!s.config) return
  pushHistory(s, `Set ${refOrPage(indexOf(s.config, pageId))} as default`)
  s.config.defaultPageId = pageId
  s.isDirty = true
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
  s.isDirty = true
}

const withTemplate = (page: PageConfig, template: PageTemplate): PageConfig => {
  if (template !== 'custom') return { ...page, template }
  const { template: _dropped, ...rest } = page
  return rest
}

type PagePatch = Parameters<PagesSlice['updatePage']>[1]

const updatePageIn = (s: DashboardDraft, pageId: string, patch: PagePatch): void =>
  replacePage(
    s,
    pageId,
    (ref) => `Edited ${ref}`,
    (page) => ({ ...page, ...patch })
  )

const setPageTemplateIn = (s: DashboardDraft, pageId: string, template: PageTemplate): void =>
  replacePage(
    s,
    pageId,
    (ref) => `Changed ${ref} template`,
    (page) => withTemplate(page, template)
  )

const movePageIn = (s: DashboardDraft, fromIndex: number, toIndex: number): void => {
  if (!s.config) return
  pushHistory(s, 'Reordered pages')
  const pages = s.config.pages
  const inRange = (index: number) => index >= 0 && index < pages.length
  if (!inRange(fromIndex) || !inRange(toIndex)) return
  const [moved] = pages.splice(fromIndex, 1)
  if (moved) pages.splice(toIndex, 0, moved)
  s.isDirty = true
}

const updateTopBarIn = (s: DashboardDraft, patch: Partial<TopBarConfig>): void => {
  if (!s.config) return
  pushHistory(s, 'Edited top bar')
  s.config.topBar = { ...s.config.topBar, ...patch }
  s.isDirty = true
}

export const createPagesSlice: SliceCreator<PagesSlice> = (set, get) => ({
  addPage: (page) => set((s) => addPageTo(s, page)),
  duplicatePage: (pageId) => {
    const config = get().config
    const index = config ? config.pages.findIndex((page) => page.id === pageId) : -1
    const original = config?.pages[index]
    if (original) set((s) => insertClone(s, index, cloneOf(original)))
  },
  removePage: (pageId) => set((s) => removePageFrom(s, pageId)),
  setDefaultPage: (pageId) => set((s) => setDefaultPageIn(s, pageId)),
  updatePage: (pageId, patch) => set((s) => updatePageIn(s, pageId, patch)),
  setPageTemplate: (pageId, template) => set((s) => setPageTemplateIn(s, pageId, template)),
  movePage: (fromIndex, toIndex) => set((s) => movePageIn(s, fromIndex, toIndex)),
  updateTopBar: (patch) => set((s) => updateTopBarIn(s, patch)),
})
