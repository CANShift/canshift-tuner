import { current, type Draft } from 'immer'
import type { PageConfig, Widget } from '@canshift/core'
import { gridTracksForConfig } from '../../lib/grid-tracks'
import { patchWidget } from '../../lib/widget-patch'
import { createId } from '../../utils/id'
import { countLabel, pushHistory, toPlacement } from './helpers'
import { pageOf, type DashboardDraft } from './widget-actions'
import { firstFreeClampedSpot, sizeOf, spotsForPaste, type GridSpot } from './widget-placement'
import type { ClipboardSlice, SliceCreator } from './types'

const cloneAt = (source: Widget, spot: GridSpot): Widget =>
  patchWidget(source, {
    id: createId(source.type),
    layout: { ...source.layout, ...spot },
    style: { ...source.style },
    config: { ...source.config },
  })

const placeCopies = (s: DashboardDraft, page: Draft<PageConfig>, sources: readonly Widget[]) => {
  const others = page.widgets.map(toPlacement)
  const tracks = gridTracksForConfig(s.config)
  return sources.flatMap((source) => {
    const spot = firstFreeClampedSpot(spotsForPaste(source.layout), sizeOf(source), others, tracks)
    if (!spot) return []
    const clone = cloneAt(source, spot)
    page.widgets.push(clone)
    others.push(toPlacement(clone))
    return [clone.id]
  })
}

const copyFrom = (s: DashboardDraft, pageId: string, widgetIds: string[]): void => {
  const page = pageOf(s, pageId)
  if (!page || widgetIds.length === 0) return
  s.clipboardWidgets = current(page.widgets).filter((w) => widgetIds.includes(w.id))
}

const pasteInto = (s: DashboardDraft, pageId: string): void => {
  const page = pageOf(s, pageId)
  const count = s.clipboardWidgets.length
  if (!page || count === 0) return
  pushHistory(s, count === 1 ? 'Pasted 1 widget' : `Pasted ${String(count)} widgets`)
  const pasted = placeCopies(s, page, s.clipboardWidgets)
  if (pasted.length === 0) {
    s.past.pop()
    return
  }
  s.selectedWidgetId = pasted[pasted.length - 1] ?? null
  s.selectedWidgetIds = pasted
}

const removeFrom = (s: DashboardDraft, pageId: string, widgetIds: string[]): void => {
  const page = pageOf(s, pageId)
  const removed = new Set(widgetIds)
  const targets = page?.widgets.filter((w) => removed.has(w.id)) ?? []
  if (!page || targets.length === 0) return
  pushHistory(s, countLabel('Deleted', targets))
  page.widgets = page.widgets.filter((w) => !removed.has(w.id))
  if (s.selectedWidgetId !== null && removed.has(s.selectedWidgetId)) s.selectedWidgetId = null
  s.selectedWidgetIds = s.selectedWidgetIds.filter((id) => !removed.has(id))
}

export const createClipboardSlice: SliceCreator<ClipboardSlice> = (set) => ({
  clipboardWidgets: [],
  copyWidgets: (pageId, widgetIds) => set((s) => copyFrom(s, pageId, widgetIds)),
  pasteWidgets: (pageId) => set((s) => pasteInto(s, pageId)),
  removeWidgets: (pageId, widgetIds) => set((s) => removeFrom(s, pageId, widgetIds)),
})
