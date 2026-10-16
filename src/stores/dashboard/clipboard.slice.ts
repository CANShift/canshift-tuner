import { current } from 'immer'
import { clampGridPlacement } from '@canshift/core'
import { gridTracksForConfig } from '../../lib/grid-tracks'
import { pushHistory } from './helpers'
import {
  countLabel,
  finishCopies,
  pageOf,
  placeCopies,
  type CopySpotFinder,
  type DashboardDraft,
} from './widget-actions'
import { firstFreeClampedSpot, sizeOf, spotsForPaste } from './widget-placement'
import type { ClipboardSlice, SliceCreator } from './types'

const nearClipboardSource: CopySpotFinder = (source, others, tracks) =>
  firstFreeClampedSpot(spotsForPaste(source.layout), sizeOf(source), others, tracks)

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
  finishCopies(s, placeCopies(s, page, s.clipboardWidgets, nearClipboardSource))
}

const removeFrom = (s: DashboardDraft, pageId: string, widgetIds: string[]): void => {
  const page = pageOf(s, pageId)
  if (!page || widgetIds.length === 0) return
  const first = page.widgets.find((w) => w.id === widgetIds[0])
  const label =
    widgetIds.length === 1 && first
      ? countLabel('Deleted', [first])
      : `Deleted ${String(widgetIds.length)} widgets`
  pushHistory(s, label)
  const removed = new Set(widgetIds)
  page.widgets = page.widgets.filter((w) => !removed.has(w.id))
  if (s.selectedWidgetId !== null && removed.has(s.selectedWidgetId)) s.selectedWidgetId = null
  s.selectedWidgetIds = s.selectedWidgetIds.filter((id) => !removed.has(id))
}

const nudgeIn = (
  s: DashboardDraft,
  pageId: string,
  widgetIds: string[],
  dCol: number,
  dRow: number
): void => {
  const targets = pageOf(s, pageId)?.widgets.filter((w) => widgetIds.includes(w.id)) ?? []
  if (targets.length === 0) return
  pushHistory(s, countLabel('Nudged', targets))
  const tracks = gridTracksForConfig(s.config)
  for (const w of targets) {
    const moved = { ...w.layout, col: w.layout.col + dCol, row: w.layout.row + dRow }
    const clamped = clampGridPlacement(moved, tracks)
    Object.assign(w.layout, { col: clamped.col, row: clamped.row })
  }
}

export const createClipboardSlice: SliceCreator<ClipboardSlice> = (set) => ({
  clipboardWidgets: [],
  copyWidgets: (pageId, widgetIds) => set((s) => copyFrom(s, pageId, widgetIds)),
  pasteWidgets: (pageId) => set((s) => pasteInto(s, pageId)),
  removeWidgets: (pageId, widgetIds) => set((s) => removeFrom(s, pageId, widgetIds)),
  nudgeWidgets: (pageId, widgetIds, dCol, dRow) =>
    set((s) => nudgeIn(s, pageId, widgetIds, dCol, dRow)),
})
