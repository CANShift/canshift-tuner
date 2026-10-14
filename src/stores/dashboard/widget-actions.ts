import type { Draft } from 'immer'
import type { GridTracks, PageConfig, Widget, WidgetLayout } from '@canshift/core'
import type { IdentifiedPlacement } from '../../utils/layout'
import { clampGridPlacement } from '@canshift/core'
import { gridTracksForConfig } from '../../lib/grid-tracks'
import { pushHistory, toPlacement, widgetRef } from './helpers'
import {
  firstFreeSpot,
  sizeOf,
  spotsAround,
  spotsBelowOrRight,
  type GridSpot,
} from './widget-placement'
import type { DashboardState } from './types'

export type DashboardDraft = Draft<DashboardState>

export const pageOf = (s: DashboardDraft, pageId: string): Draft<PageConfig> | undefined =>
  s.config?.pages.find((page) => page.id === pageId)

const selectOnly = (s: DashboardDraft, ids: string[]): void => {
  s.selectedWidgetId = ids[ids.length - 1] ?? null
  s.selectedWidgetIds = ids
}

export const countLabel = (verb: string, widgets: readonly Widget[]): string => {
  const [first] = widgets
  if (widgets.length === 1 && first) return `${verb} ${widgetRef(first)}`
  return `${verb} ${String(widgets.length)} widgets`
}

export const addWidgetTo = (s: DashboardDraft, pageId: string, widget: Widget): void => {
  const page = pageOf(s, pageId)
  if (!page || !s.config) return
  pushHistory(s, `Added ${widgetRef(widget)}`)
  const reference = page.widgets.find((w) => w.id === s.selectedWidgetId)
  const size = sizeOf(widget)
  const candidates = reference ? spotsAround(reference.layout, size) : []
  const spot = firstFreeSpot(
    candidates,
    size,
    page.widgets.map(toPlacement),
    gridTracksForConfig(s.config)
  )
  if (spot) {
    widget.layout.col = spot.col
    widget.layout.row = spot.row
  }
  page.widgets.push(widget)
  selectOnly(s, [widget.id])
  s.isDirty = true
}

const cloneAt = (source: Widget, spot: { col: number; row: number }): Widget => ({
  ...source,
  id: `${source.type}_${crypto.randomUUID()}`,
  layout: { ...source.layout, ...spot },
  style: { ...source.style },
  config: { ...source.config },
})

export type CopySpotFinder = (
  source: Widget,
  others: IdentifiedPlacement[],
  tracks: GridTracks
) => GridSpot | null

const besideSource: CopySpotFinder = (source, others, tracks) =>
  firstFreeSpot(spotsBelowOrRight(source.layout), sizeOf(source), others, tracks)

export const placeCopies = (
  s: DashboardDraft,
  page: Draft<PageConfig>,
  sources: readonly Widget[],
  spotFor: CopySpotFinder
): string[] => {
  const others = page.widgets.map(toPlacement)
  const tracks = gridTracksForConfig(s.config)
  return sources.flatMap((source) => {
    const spot = spotFor(source, others, tracks)
    if (!spot) return []
    const clone = cloneAt(source, spot)
    page.widgets.push(clone)
    others.push(toPlacement(clone))
    return [clone.id]
  })
}

export const finishCopies = (s: DashboardDraft, newIds: string[]): void => {
  if (newIds.length === 0) {
    s.past.pop()
    return
  }
  selectOnly(s, newIds)
  s.isDirty = true
}

export const duplicateWidgetsIn = (
  s: DashboardDraft,
  pageId: string,
  widgetIds: string[]
): void => {
  const page = pageOf(s, pageId)
  if (!page) return
  const ordered = widgetIds.flatMap((id) => page.widgets.filter((w) => w.id === id))
  if (ordered.length === 0) return
  pushHistory(s, countLabel('Duplicated', ordered))
  finishCopies(s, placeCopies(s, page, ordered, besideSource))
}

export const reorderWidgetIn = (
  s: DashboardDraft,
  pageId: string,
  widgetId: string,
  direction: 1 | -1
): void => {
  const page = pageOf(s, pageId)
  if (!page) return
  const from = page.widgets.findIndex((w) => w.id === widgetId)
  const to = from + direction
  const target = page.widgets[from]
  if (from === -1 || to < 0 || to >= page.widgets.length || !target) return
  pushHistory(s, `Moved ${widgetRef(target)} ${direction < 0 ? 'up' : 'down'}`)
  page.widgets.splice(from, 1)
  page.widgets.splice(to, 0, target)
  s.isDirty = true
}

export const removeWidgetFrom = (s: DashboardDraft, pageId: string, widgetId: string): void => {
  const page = pageOf(s, pageId)
  if (!page) return
  const target = page.widgets.find((w) => w.id === widgetId)
  pushHistory(s, `Deleted ${target ? widgetRef(target) : 'widget'}`)
  page.widgets = page.widgets.filter((w) => w.id !== widgetId)
  if (s.selectedWidgetId === widgetId) s.selectedWidgetId = null
  s.selectedWidgetIds = s.selectedWidgetIds.filter((id) => id !== widgetId)
  s.isDirty = true
}

const editLabel = (existing: Widget, patch: Partial<Widget>): string => {
  const rebound = patch.signal !== undefined && patch.signal !== existing.signal
  if (rebound)
    return `Rebound ${widgetRef(existing)} to ${patch.signal !== '' ? String(patch.signal) : 'nothing'}`
  if (patch.layout !== undefined) return `Resized ${widgetRef(existing)}`
  return `Edited ${widgetRef(existing)}`
}

interface WidgetSlot {
  page: Draft<PageConfig>
  index: number
  widget: Widget
}

export const widgetIn = (
  s: DashboardDraft,
  pageId: string,
  widgetId: string
): WidgetSlot | null => {
  const page = pageOf(s, pageId)
  const index = page?.widgets.findIndex((w) => w.id === widgetId) ?? -1
  const widget = page?.widgets[index]
  return page && widget ? { page, index, widget } : null
}

export const updateWidgetIn = (
  s: DashboardDraft,
  pageId: string,
  widgetId: string,
  patch: Partial<Widget>
): void => {
  const slot = widgetIn(s, pageId, widgetId)
  if (!slot) return
  pushHistory(s, editLabel(slot.widget, patch))
  const merged = { ...slot.widget, ...patch }
  const clamped = clampGridPlacement(merged.layout, gridTracksForConfig(s.config))
  merged.layout = { ...clamped, zOrder: merged.layout.zOrder }
  slot.page.widgets[slot.index] = merged
  s.isDirty = true
}

export const relayoutSlot = (
  s: DashboardDraft,
  slot: WidgetSlot,
  layout: Partial<WidgetLayout>
): void => {
  slot.page.widgets[slot.index] = { ...slot.widget, layout: { ...slot.widget.layout, ...layout } }
  s.isDirty = true
}
