import { LAYOUT_GRID, clampGridPlacement } from '@canshift/core'
import type { DisplayTier, Widget } from '@canshift/core'

const MIN_SPAN = 1

export interface DraggingWidget {
  id: string
  startCol: number
  startRow: number
  colSpan: number
  rowSpan: number
}

export interface DraggedSet {
  widgets: DraggingWidget[]
  isMulti: boolean
}

export interface GridDelta {
  cols: number
  rows: number
}

export interface PlacedWidget {
  id: string
  col: number
  row: number
}

export interface PointerTravel {
  dx: number
  dy: number
}

export interface GridPitch {
  col: number
  row: number
}

interface Axis {
  start: (w: DraggingWidget) => number
  span: (w: DraggingWidget) => number
  tracks: (tier: DisplayTier) => number
}

const AXES: Record<'col' | 'row', Axis> = {
  col: { start: (w) => w.startCol, span: (w) => w.colSpan, tracks: (tier) => tier.columns },
  row: { start: (w) => w.startRow, span: (w) => w.rowSpan, tracks: (tier) => tier.rows },
}

export const trackPitch = (areaSize: number, tracks: number): number =>
  (areaSize - 2 * LAYOUT_GRID.FRAME_PADDING + LAYOUT_GRID.GUTTER) / tracks

const draggingWidgetOf = (w: Widget): DraggingWidget => ({
  id: w.id,
  startCol: w.layout.col,
  startRow: w.layout.row,
  colSpan: w.layout.colSpan,
  rowSpan: w.layout.rowSpan,
})

export const draggedSet = (
  widget: Widget,
  pageWidgets: readonly Widget[],
  selectedIds: readonly string[]
): DraggedSet => {
  const isMulti = selectedIds.length > 1 && selectedIds.includes(widget.id)
  if (!isMulti) return { widgets: [draggingWidgetOf(widget)], isMulti }
  const selected = pageWidgets.filter((w) => selectedIds.includes(w.id))
  return { widgets: selected.map(draggingWidgetOf), isMulti }
}

const clampGroupDelta = (raw: number, widgets: DraggingWidget[], axis: Axis, tier: DisplayTier) => {
  const tracks = axis.tracks(tier)
  const min = Math.max(...widgets.map((w) => -axis.start(w)))
  const max = Math.min(...widgets.map((w) => tracks - axis.span(w) - axis.start(w)))
  return min > max ? raw : Math.min(Math.max(raw, min), max)
}

const axisDelta = (raw: number, dragged: DraggedSet, axis: Axis, tier: DisplayTier): number =>
  dragged.isMulti ? clampGroupDelta(raw, dragged.widgets, axis, tier) : raw

export const dragDelta = (
  travel: PointerTravel,
  pitch: GridPitch,
  dragged: DraggedSet,
  tier: DisplayTier
): GridDelta => ({
  cols: axisDelta(Math.round(travel.dx / pitch.col), dragged, AXES.col, tier),
  rows: axisDelta(Math.round(travel.dy / pitch.row), dragged, AXES.row, tier),
})

export const placeDragged = (
  widgets: readonly DraggingWidget[],
  delta: GridDelta,
  tier: DisplayTier
): PlacedWidget[] =>
  widgets.map((dw) => {
    const clamped = clampGridPlacement(
      {
        col: dw.startCol + delta.cols,
        colSpan: dw.colSpan,
        row: dw.startRow + delta.rows,
        rowSpan: dw.rowSpan,
      },
      tier
    )
    return { id: dw.id, col: clamped.col, row: clamped.row }
  })

export const leftStart = (placed: readonly PlacedWidget[], widgets: readonly DraggingWidget[]) =>
  placed.some((p, i) => {
    const dw = widgets[i]
    return dw !== undefined && (p.col !== dw.startCol || p.row !== dw.startRow)
  })

export const resizedSpan = (
  startSpan: number,
  startCol: number,
  deltaCols: number,
  columns: number
) => Math.min(columns - startCol, Math.max(MIN_SPAN, startSpan + deltaCols))
