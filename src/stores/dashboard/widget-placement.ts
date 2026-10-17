import type { GridTracks, Widget, WidgetLayout } from '@canshift/core'
import { clampGridPlacement, isSpanOverflowing, placementsOverlap } from '@canshift/core'
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

const clampedSpot = (spot: GridSpot, size: SpanSize, tracks: GridTracks): GridSpot => {
  const clamped = clampGridPlacement({ ...spot, ...size }, tracks)
  return { col: clamped.col, row: clamped.row }
}

export const firstFreeClampedSpot = (
  candidates: readonly GridSpot[],
  size: SpanSize,
  others: IdentifiedPlacement[],
  tracks: GridTracks
): GridSpot | null => {
  const clamped = candidates.map((candidate) => clampedSpot(candidate, size, tracks))
  const free = clamped.find(
    (spot) => !others.some((other) => placementsOverlap({ ...spot, ...size }, other))
  )
  return free ?? autoPlace(size, others)
}

export const spotsForPaste = ({ col, colSpan, row, rowSpan }: WidgetLayout): GridSpot[] => [
  { col: col + 1, row: row + 1 },
  { col, row: row + rowSpan },
  { col: col + colSpan, row },
]
