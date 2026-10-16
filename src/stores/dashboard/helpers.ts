import { current } from 'immer'
import type { DashboardConfig, Widget } from '@canshift/core'
import type { IdentifiedPlacement } from '../../utils/layout'

export const HISTORY_LIMIT = 25

export const toPlacement = (w: Widget): IdentifiedPlacement => ({
  id: w.id,
  col: w.layout.col,
  colSpan: w.layout.colSpan,
  row: w.layout.row,
  rowSpan: w.layout.rowSpan,
})

export interface HistoryEntry {
  config: DashboardConfig
  label: string
}

interface HistoryHost {
  config: DashboardConfig | null
  past: HistoryEntry[]
  future: HistoryEntry[]
}

export const pushHistory = (s: HistoryHost, label: string): void => {
  if (!s.config) return
  s.past.push({ config: current(s.config), label })
  if (s.past.length > HISTORY_LIMIT) s.past.shift()
  s.future = []
}

export const widgetRef = (w: Pick<Widget, 'signal' | 'type'>): string =>
  w.signal ? w.signal : w.type

export const pageRef = (index: number): string => `page ${String(index + 1).padStart(2, '0')}`

export const fixupSelection = (s: {
  config: { pages: { id: string }[] } | null
  selectedPageId: string | null
  selectedWidgetId: string | null
  selectedWidgetIds: string[]
}): void => {
  if (!s.config) return
  s.selectedWidgetId = null
  s.selectedWidgetIds = []
  const pageStillExists = s.config.pages.some((p) => p.id === s.selectedPageId)
  if (!pageStillExists) s.selectedPageId = s.config.pages[0]?.id ?? null
}
