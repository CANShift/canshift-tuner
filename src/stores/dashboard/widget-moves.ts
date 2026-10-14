import type { WidgetLayout } from '@canshift/core'
import { placementsOverlap } from '@canshift/core'
import { autoPlace, resolveCollisions } from '../../utils/layout'
import { pushHistory, toPlacement, widgetRef } from './helpers'
import { pageOf, relayoutSlot, widgetIn, type DashboardDraft } from './widget-actions'
import { sizeOf } from './widget-placement'

export interface WidgetMove {
  id: string
  col: number
  row: number
}

export const moveWidgetIn = (
  s: DashboardDraft,
  pageId: string,
  widgetId: string,
  layout: Partial<WidgetLayout>
): void => {
  const slot = widgetIn(s, pageId, widgetId)
  if (slot) relayoutSlot(s, slot, layout)
}

export const commitWidgetMoveIn = (
  s: DashboardDraft,
  pageId: string,
  widgetId: string,
  layout: Partial<WidgetLayout>
): void => {
  const slot = widgetIn(s, pageId, widgetId)
  if (!slot) return
  pushHistory(s, `Moved ${widgetRef(slot.widget)}`)
  relayoutSlot(s, slot, layout)
}

export const moveWidgetsIn = (
  s: DashboardDraft,
  pageId: string,
  moves: readonly WidgetMove[]
): void => {
  const page = pageOf(s, pageId)
  if (!page) return
  for (const move of moves) {
    const widget = page.widgets.find((w) => w.id === move.id)
    if (widget) Object.assign(widget.layout, { col: move.col, row: move.row })
  }
  s.isDirty = true
}

const applyPositions = (
  s: DashboardDraft,
  pageId: string,
  positions: ReadonlyMap<string, { col: number; row: number }>
) => {
  for (const widget of pageOf(s, pageId)?.widgets ?? []) {
    const next = positions.get(widget.id)
    if (next) Object.assign(widget.layout, { col: next.col, row: next.row })
  }
}

export const resolveCollisionsIn = (s: DashboardDraft, pageId: string, widgetId: string): void => {
  const page = pageOf(s, pageId)
  const widget = page?.widgets.find((w) => w.id === widgetId)
  if (!page || !widget) return
  const othersOf = () => page.widgets.filter((w) => w.id !== widgetId).map(toPlacement)
  applyPositions(s, pageId, resolveCollisions(toPlacement(widget), othersOf()))
  const finalOthers = othersOf()
  const stillOverlaps = finalOthers.some((other) => placementsOverlap(toPlacement(widget), other))
  const fallback = stillOverlaps ? autoPlace(sizeOf(widget), finalOthers) : null
  if (fallback) Object.assign(widget.layout, { col: fallback.col, row: fallback.row })
  s.isDirty = true
}

export const beginDragIn = (s: DashboardDraft, pageId: string, widgetIds: string[]): void => {
  const targets = pageOf(s, pageId)?.widgets.filter((w) => widgetIds.includes(w.id)) ?? []
  const [first] = targets
  if (!first) return
  pushHistory(
    s,
    targets.length === 1 ? `Moved ${widgetRef(first)}` : `Moved ${String(targets.length)} widgets`
  )
}
