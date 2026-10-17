import type { GridTracks, Widget, WidgetLayout } from '@canshift/core'
import { clampGridPlacement, placementsOverlap } from '@canshift/core'
import { gridTracksForConfig } from '../../lib/grid-tracks'
import { autoPlace, resolveCollisions } from '../../utils/layout'
import { countLabel, pushHistory, toPlacement } from './helpers'
import { pageOf, widgetIn, type DashboardDraft } from './widget-actions'
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
  if (!slot) return
  slot.page.widgets[slot.index] = { ...slot.widget, layout: { ...slot.widget.layout, ...layout } }
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
}

export const beginDragIn = (s: DashboardDraft, pageId: string, widgetIds: string[]): void => {
  const targets = pageOf(s, pageId)?.widgets.filter((w) => widgetIds.includes(w.id)) ?? []
  if (targets.length > 0) pushHistory(s, countLabel('Moved', targets))
}

export interface GridStep {
  cols: number
  rows: number
}

const MIN_SPAN = 1

const nudged = (layout: WidgetLayout, step: GridStep, tracks: GridTracks) =>
  clampGridPlacement(
    { ...layout, col: layout.col + step.cols, row: layout.row + step.rows },
    tracks
  )

const between = (value: number, max: number): number => Math.min(max, Math.max(MIN_SPAN, value))

const resized = (layout: WidgetLayout, step: GridStep, tracks: GridTracks) => ({
  colSpan: between(layout.colSpan + step.cols, tracks.columns - layout.col),
  rowSpan: between(layout.rowSpan + step.rows, tracks.rows - layout.row),
})

type LayoutStep = (
  layout: WidgetLayout,
  step: GridStep,
  tracks: GridTracks
) => Partial<WidgetLayout>

const stepWidgets =
  (verb: string, apply: LayoutStep) =>
  (s: DashboardDraft, pageId: string, widgetIds: readonly string[], step: GridStep): void => {
    const targets: Widget[] =
      pageOf(s, pageId)?.widgets.filter((w) => widgetIds.includes(w.id)) ?? []
    if (targets.length === 0) return
    pushHistory(s, countLabel(verb, targets))
    const tracks = gridTracksForConfig(s.config)
    for (const widget of targets) Object.assign(widget.layout, apply(widget.layout, step, tracks))
  }

export const nudgeWidgetsIn = stepWidgets('Nudged', (layout, step, tracks) => {
  const { col, row } = nudged(layout, step, tracks)
  return { col, row }
})

export const resizeWidgetsIn = stepWidgets('Resized', resized)
