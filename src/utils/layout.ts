import type { GridPlacement } from '@canshift/core'
import { BASE_GRID_TRACKS, clampGridPlacement, placementsOverlap } from '@canshift/core'
import type { GridTracks } from '@canshift/core'
import { uniquePairs } from './unique-pairs'

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

const pushAway = (anchor: GridPlacement, victim: GridPlacement): GridPlacement => {
  const pushRight = anchor.col + anchor.colSpan - victim.col
  const pushLeft = victim.col + victim.colSpan - anchor.col
  const pushDown = anchor.row + anchor.rowSpan - victim.row
  const pushUp = victim.row + victim.rowSpan - anchor.row

  const minH = Math.min(pushRight, pushLeft)
  const minV = Math.min(pushDown, pushUp)

  let col = victim.col
  let row = victim.row

  if (minH <= minV) {
    col = pushRight <= pushLeft ? anchor.col + anchor.colSpan : anchor.col - victim.colSpan
  } else {
    row = pushDown <= pushUp ? anchor.row + anchor.rowSpan : anchor.row - victim.rowSpan
  }

  return clampGridPlacement({ ...victim, col, row })
}

const spanArea = (p: GridPlacement): number => p.colSpan * p.rowSpan

const pickVictim = (
  a: IdentifiedPlacement,
  b: IdentifiedPlacement,
  movedId: string
): [IdentifiedPlacement, IdentifiedPlacement] => {
  if (a.id === movedId) return [a, b]
  if (b.id === movedId) return [b, a]
  return spanArea(a) <= spanArea(b) ? [b, a] : [a, b]
}

const collidingPairs = (
  placements: IdentifiedPlacement[]
): [IdentifiedPlacement, IdentifiedPlacement][] =>
  uniquePairs(placements).filter(([a, b]) => placementsOverlap(a, b))

const resolvePass = (pos: Map<string, IdentifiedPlacement>, movedId: string): boolean => {
  const pairs = collidingPairs(Array.from(pos.values()))
  for (const [a, b] of pairs) {
    const [anchor, victim] = pickVictim(a, b, movedId)
    const shifted = pushAway(anchor, victim)
    pos.set(victim.id, { ...victim, col: shifted.col, row: shifted.row })
  }
  return pairs.length > 0
}

const MAX_PASSES = 8

export const resolveCollisions = (
  moved: IdentifiedPlacement,
  others: readonly IdentifiedPlacement[]
): Map<string, TrackPosition> => {
  const pos = new Map<string, IdentifiedPlacement>()
  pos.set(moved.id, { ...moved })
  for (const o of others) pos.set(o.id, { ...o })

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    if (!resolvePass(pos, moved.id)) break
  }

  const result = new Map<string, TrackPosition>()
  for (const [id, placement] of pos) {
    if (id === moved.id) continue
    const original = others.find((o) => o.id === id)
    if (original && (original.col !== placement.col || original.row !== placement.row)) {
      result.set(id, { col: placement.col, row: placement.row })
    }
  }

  return result
}
