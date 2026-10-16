import type { PageConfig, Widget } from '@canshift/core'
import { produce } from 'immer'

export type Step = 1 | -1

const byReadingOrder = (a: Widget, b: Widget): number =>
  a.layout.row - b.layout.row || a.layout.col - b.layout.col

export const inReadingOrder = (widgets: readonly Widget[]): Widget[] =>
  [...widgets].sort(byReadingOrder)

export const neighbourOf = (page: PageConfig, widgetId: string, step: Step): Widget | null => {
  const ordered = inReadingOrder(page.widgets)
  const index = ordered.findIndex((widget) => widget.id === widgetId)
  if (index < 0) return null
  return ordered[index + step] ?? null
}

export const positionOf = (page: PageConfig, widgetId: string): number =>
  inReadingOrder(page.widgets).findIndex((widget) => widget.id === widgetId) + 1

const PLACE_KEYS = ['col', 'row', 'colSpan', 'rowSpan'] as const

const swapPlaces = (a: Widget['layout'], b: Widget['layout']): void => {
  for (const key of PLACE_KEYS) [a[key], b[key]] = [b[key], a[key]]
}

export const swappedWithNeighbour = (
  page: PageConfig,
  widgetId: string,
  step: Step
): PageConfig | null => {
  const neighbour = neighbourOf(page, widgetId, step)
  if (neighbour === null) return null
  return produce(page, (draft) => {
    const own = draft.widgets.find((widget) => widget.id === widgetId)
    const other = draft.widgets.find((widget) => widget.id === neighbour.id)
    if (own && other) swapPlaces(own.layout, other.layout)
  })
}
