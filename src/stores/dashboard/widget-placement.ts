import type { GridTracks, Widget, WidgetLayout } from '@canshift/core'
import { isSpanOverflowing, placementsOverlap } from '@canshift/core'
import { autoPlace, type IdentifiedPlacement } from '../../utils/layout'

export interface GridSpot {
  col: number
  row: number
}

interface SpanSize {
  colSpan: number
  rowSpan: number
}

const fits = (
  spot: GridSpot,
  size: SpanSize,
  others: readonly IdentifiedPlacement[],
  tracks: GridTracks
) => {
  const placement = { ...spot, ...size }
  if (isSpanOverflowing(placement, tracks)) return false
  return !others.some((other) => placementsOverlap(placement, other))
}

export const firstFreeSpot = (
  candidates: readonly GridSpot[],
  size: SpanSize,
  others: IdentifiedPlacement[],
  tracks: GridTracks
): GridSpot | null => {
  const spot = candidates.find((candidate) => fits(candidate, size, others, tracks))
  return spot ?? autoPlace(size, others)
}

export const spotsAround = (ref: WidgetLayout, size: SpanSize): GridSpot[] => [
  { col: ref.col + ref.colSpan, row: ref.row },
  { col: ref.col, row: ref.row + ref.rowSpan },
  { col: ref.col - size.colSpan, row: ref.row },
  { col: ref.col, row: ref.row - size.rowSpan },
]

export const sizeOf = (widget: Widget): SpanSize => ({
  colSpan: widget.layout.colSpan,
  rowSpan: widget.layout.rowSpan,
})
