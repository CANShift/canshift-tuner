import type { GridTracks, Widget } from '@canshift/core'
import { BASE_GRID_TRACKS } from '@canshift/core'
import { isSpanOverflowing, placementsOverlap } from '@canshift/core'
import { uniquePairs } from './unique-pairs'

const overlapCounts = ([a, b]: [Widget, Widget]): boolean =>
  a.type !== 'warning' && b.type !== 'warning' && placementsOverlap(a.layout, b.layout)

export const overlappingWidgetIds = (widgets: readonly Widget[]): Set<string> =>
  new Set(
    uniquePairs(widgets)
      .filter(overlapCounts)
      .flatMap(([a, b]) => [a.id, b.id])
  )

export const overflowingWidgetIds = (
  widgets: readonly Widget[],
  tracks: GridTracks = BASE_GRID_TRACKS
): Set<string> => {
  const ids = new Set<string>()
  for (const w of widgets) {
    if (isSpanOverflowing(w.layout, tracks)) ids.add(w.id)
  }
  return ids
}
