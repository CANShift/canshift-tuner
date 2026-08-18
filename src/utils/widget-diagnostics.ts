import type { GridTracks, Widget } from '@canshift/core'
import { BASE_GRID_TRACKS } from '@canshift/core'
import { isSpanOverflowing, placementsOverlap } from '@canshift/core'

export const overlappingWidgetIds = (widgets: readonly Widget[]): Set<string> => {
  const ids = new Set<string>()
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      const a = widgets[i]
      const b = widgets[j]
      if (!a || !b) continue
      if (a.type === 'warning' || b.type === 'warning') continue
      if (placementsOverlap(a.layout, b.layout)) {
        ids.add(a.id)
        ids.add(b.id)
      }
    }
  }
  return ids
}

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
