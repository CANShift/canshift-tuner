import type { DashboardDraft } from './widget-actions'
import type { SelectionSlice, SliceCreator } from './types'

const lastOf = (ids: readonly string[]): string | null => ids[ids.length - 1] ?? null

const selectPageIn = (s: DashboardDraft, pageId: string | null): void => {
  s.selectedPageId = pageId
  s.selectedWidgetId = null
  s.selectedWidgetIds = []
}

const selectWidgetsIn = (s: DashboardDraft, widgetIds: string[]): void => {
  s.selectedWidgetIds = widgetIds
  s.selectedWidgetId = lastOf(widgetIds)
}

const toggleIn = (s: DashboardDraft, widgetId: string): void => {
  const selected = s.selectedWidgetIds.includes(widgetId)
  const next = selected
    ? s.selectedWidgetIds.filter((id) => id !== widgetId)
    : [...s.selectedWidgetIds, widgetId]
  selectWidgetsIn(s, next)
}

export const createSelectionSlice: SliceCreator<SelectionSlice> = (set) => ({
  selectedPageId: null,
  selectedWidgetId: null,
  selectedWidgetIds: [],
  selectPage: (pageId) => set((s) => selectPageIn(s, pageId)),
  selectWidget: (widgetId) => set((s) => selectWidgetsIn(s, widgetId ? [widgetId] : [])),
  selectWidgets: (widgetIds) => set((s) => selectWidgetsIn(s, widgetIds)),
  toggleWidgetSelection: (widgetId) => set((s) => toggleIn(s, widgetId)),
})
