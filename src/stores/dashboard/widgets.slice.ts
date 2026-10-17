import { addWidgetTo, removeWidgetFrom, updateWidgetIn } from './widget-actions'
import {
  beginDragIn,
  moveWidgetIn,
  moveWidgetsIn,
  nudgeWidgetsIn,
  resizeWidgetsIn,
  resolveCollisionsIn,
} from './widget-moves'
import type { SliceCreator, WidgetsSlice } from './types'

export const createWidgetsSlice: SliceCreator<WidgetsSlice> = (set) => ({
  addWidget: (pageId, widget) => set((s) => addWidgetTo(s, pageId, widget)),
  removeWidget: (pageId, widgetId) => set((s) => removeWidgetFrom(s, pageId, widgetId)),
  updateWidget: (pageId, widgetId, patch) => set((s) => updateWidgetIn(s, pageId, widgetId, patch)),
  moveWidget: (pageId, widgetId, layout) => set((s) => moveWidgetIn(s, pageId, widgetId, layout)),
  moveWidgets: (pageId, moves) => set((s) => moveWidgetsIn(s, pageId, moves)),
  resolveWidgetCollisions: (pageId, widgetId) =>
    set((s) => resolveCollisionsIn(s, pageId, widgetId)),
  beginDrag: (pageId, widgetIds) => set((s) => beginDragIn(s, pageId, widgetIds)),
  nudgeWidgets: (pageId, widgetIds, step) => set((s) => nudgeWidgetsIn(s, pageId, widgetIds, step)),
  resizeWidgets: (pageId, widgetIds, step) =>
    set((s) => resizeWidgetsIn(s, pageId, widgetIds, step)),
})
