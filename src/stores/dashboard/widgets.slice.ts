import { addWidgetTo, removeWidgetFrom, updateWidgetIn } from './widget-actions'
import type { SliceCreator, WidgetsSlice } from './types'

export const createWidgetsSlice: SliceCreator<WidgetsSlice> = (set) => ({
  addWidget: (pageId, widget) => set((s) => addWidgetTo(s, pageId, widget)),
  removeWidget: (pageId, widgetId) => set((s) => removeWidgetFrom(s, pageId, widgetId)),
  updateWidget: (pageId, widgetId, patch) => set((s) => updateWidgetIn(s, pageId, widgetId, patch)),
})
