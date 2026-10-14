import type { GridTracks, Widget, WidgetLayout } from '@canshift/core'
import { clampGridPlacement } from '@canshift/core'
import { gridTracksForConfig } from '../../lib/grid-tracks'
import { pushHistory } from './helpers'
import { pageOf, type DashboardDraft } from './widget-actions'
import type { AlignDirection, LayoutOpsSlice, SliceCreator } from './types'

const MIN_TO_ALIGN = 2
const MIN_TO_DISTRIBUTE = 3

interface Bounds {
  minCol: number
  maxCol: number
  minRow: number
  maxRow: number
}

const boundsOf = (widgets: readonly Widget[]): Bounds => ({
  minCol: Math.min(...widgets.map((w) => w.layout.col)),
  maxCol: Math.max(...widgets.map((w) => w.layout.col + w.layout.colSpan)),
  minRow: Math.min(...widgets.map((w) => w.layout.row)),
  maxRow: Math.max(...widgets.map((w) => w.layout.row + w.layout.rowSpan)),
})

const ALIGNED: Record<AlignDirection, (layout: WidgetLayout, b: Bounds) => Partial<WidgetLayout>> =
  {
    left: (_layout, b) => ({ col: b.minCol }),
    right: (layout, b) => ({ col: b.maxCol - layout.colSpan }),
    top: (_layout, b) => ({ row: b.minRow }),
    bottom: (layout, b) => ({ row: b.maxRow - layout.rowSpan }),
    'center-h': (layout, b) => ({
      col: Math.round((b.minCol + b.maxCol) / 2 - layout.colSpan / 2),
    }),
    'center-v': (layout, b) => ({
      row: Math.round((b.minRow + b.maxRow) / 2 - layout.rowSpan / 2),
    }),
  }

const placeClamped = (widget: Widget, placement: WidgetLayout, tracks: GridTracks): void => {
  const clamped = clampGridPlacement(placement, tracks)
  widget.layout.col = clamped.col
  widget.layout.row = clamped.row
}

const targetsIn = (s: DashboardDraft, pageId: string, widgetIds: string[]): Widget[] =>
  pageOf(s, pageId)?.widgets.filter((w) => widgetIds.includes(w.id)) ?? []

const alignIn = (
  s: DashboardDraft,
  pageId: string,
  widgetIds: string[],
  direction: AlignDirection
): void => {
  const targets = targetsIn(s, pageId, widgetIds)
  if (targets.length < MIN_TO_ALIGN) return
  pushHistory(s, `Aligned ${String(targets.length)} widgets ${direction}`)
  const bounds = boundsOf(targets)
  const tracks = gridTracksForConfig(s.config)
  for (const w of targets)
    placeClamped(w, { ...w.layout, ...ALIGNED[direction](w.layout, bounds) }, tracks)
  s.isDirty = true
}

interface Axis {
  start: 'col' | 'row'
  span: 'colSpan' | 'rowSpan'
}

const AXES: Record<'h' | 'v', Axis> = {
  h: { start: 'col', span: 'colSpan' },
  v: { start: 'row', span: 'rowSpan' },
}

const distributeAlong = (
  widgets: readonly Widget[],
  { start, span }: Axis,
  tracks: GridTracks
): void => {
  const sorted = [...widgets].sort((a, b) => a.layout[start] - b.layout[start])
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (!first || !last) return
  const extent = last.layout[start] + last.layout[span] - first.layout[start]
  const occupied = sorted.reduce((sum, w) => sum + w.layout[span], 0)
  const gap = (extent - occupied) / (sorted.length - 1)
  let cursor = first.layout[start]
  for (const w of sorted) {
    w.layout[start] = clampGridPlacement({ ...w.layout, [start]: Math.round(cursor) }, tracks)[
      start
    ]
    cursor += w.layout[span] + gap
  }
}

const distributeIn = (
  s: DashboardDraft,
  pageId: string,
  widgetIds: string[],
  axis: 'h' | 'v'
): void => {
  const targets = targetsIn(s, pageId, widgetIds)
  if (targets.length < MIN_TO_DISTRIBUTE) return
  pushHistory(s, `Distributed ${String(targets.length)} widgets`)
  distributeAlong(targets, AXES[axis], gridTracksForConfig(s.config))
  s.isDirty = true
}

export const createLayoutOpsSlice: SliceCreator<LayoutOpsSlice> = (set) => ({
  alignWidgets: (pageId, widgetIds, direction) =>
    set((s) => alignIn(s, pageId, widgetIds, direction)),
  distributeWidgets: (pageId, widgetIds, axis) =>
    set((s) => distributeIn(s, pageId, widgetIds, axis)),
})
