import type { GridPlacement } from '@canshift/core'
import { BASE_GRID_TRACKS, placementsOverlap } from '@canshift/core'
import type { GridTracks } from '@canshift/core'

export interface IdentifiedPlacement extends GridPlacement {
  id: string
}

export interface SpanSize {
  colSpan: number
  rowSpan: number
}

export interface TrackPosition {
  col: number
  row: number
}

const startPositions = (span: number, tracks: number): number[] =>
  Array.from({ length: Math.max(0, tracks - span + 1) }, (_, i) => i)

const rowMajorPositions = (colSpan: number, rowSpan: number, tracks: GridTracks): TrackPosition[] =>
  startPositions(rowSpan, tracks.rows).flatMap((row) =>
    startPositions(colSpan, tracks.columns).map((col) => ({ col, row }))
  )

export const autoPlace = (
  size: SpanSize,
  others: readonly GridPlacement[],
  tracks: GridTracks = BASE_GRID_TRACKS
): TrackPosition | null => {
  const colSpan = Math.min(size.colSpan, tracks.columns)
  const rowSpan = Math.min(size.rowSpan, tracks.rows)
  const free = rowMajorPositions(colSpan, rowSpan, tracks).find(
    ({ col, row }) => !others.some((o) => placementsOverlap({ col, colSpan, row, rowSpan }, o))
  )
  return free ?? null
}
