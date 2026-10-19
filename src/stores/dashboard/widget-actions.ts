import type { Draft } from 'immer'
import type { PageConfig, Widget } from '@canshift/core'
import { clampGridPlacement } from '@canshift/core'
import { gridTracksForConfig } from '../../lib/grid-tracks'
import { pushHistory, toPlacement, widgetRef } from './helpers'
import { firstFreeSpot, sizeOf, spotsAround } from './widget-placement'
import type { DashboardState } from './types'
import { patchWidget, type WidgetPatch } from '../../lib/widget-patch'

export type DashboardDraft = Draft<DashboardState>

export const pageOf = (s: DashboardDraft, pageId: string): Draft<PageConfig> | undefined =>
  s.config?.pages.find((page) => page.id === pageId)

const selectOnly = (s: DashboardDraft, ids: string[]): void => {
  s.selectedWidgetId = ids[ids.length - 1] ?? null
  s.selectedWidgetIds = ids
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
}

export const removeWidgetFrom = (s: DashboardDraft, pageId: string, widgetId: string): void => {
  const page = pageOf(s, pageId)
  if (!page) return
  const target = page.widgets.find((w) => w.id === widgetId)
  pushHistory(s, `Deleted ${target ? widgetRef(target) : 'widget'}`)
  page.widgets = page.widgets.filter((w) => w.id !== widgetId)
  if (s.selectedWidgetId === widgetId) s.selectedWidgetId = null
  s.selectedWidgetIds = s.selectedWidgetIds.filter((id) => id !== widgetId)
}

const editLabel = (existing: Widget, patch: WidgetPatch): string => {
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
  patch: WidgetPatch
): void => {
  const slot = widgetIn(s, pageId, widgetId)
  if (!slot) return
  pushHistory(s, editLabel(slot.widget, patch))
  const merged = patchWidget(slot.widget, patch)
  const clamped = clampGridPlacement(merged.layout, gridTracksForConfig(s.config))
  merged.layout = { ...clamped, zOrder: merged.layout.zOrder }
  slot.page.widgets[slot.index] = merged
}
