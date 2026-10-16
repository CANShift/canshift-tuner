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

export const createSelectionSlice: SliceCreator<SelectionSlice> = (set) => ({
  selectedPageId: null,
  selectedWidgetId: null,
  selectedWidgetIds: [],
  selectPage: (pageId) => set((s) => selectPageIn(s, pageId)),
  selectWidget: (widgetId) => set((s) => selectWidgetsIn(s, widgetId ? [widgetId] : [])),
})
