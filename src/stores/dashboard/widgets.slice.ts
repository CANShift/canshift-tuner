import {
  addWidgetTo,
  duplicateWidgetsIn,
  removeWidgetFrom,
  reorderWidgetIn,
  updateWidgetIn,
} from './widget-actions'
import {
  beginDragIn,
  commitWidgetMoveIn,
  moveWidgetIn,
  moveWidgetsIn,
  resolveCollisionsIn,
} from './widget-moves'
import type { SliceCreator, WidgetsSlice } from './types'

export const createWidgetsSlice: SliceCreator<WidgetsSlice> = (set) => ({
  addWidget: (pageId, widget) => set((s) => addWidgetTo(s, pageId, widget)),
  duplicateWidgets: (pageId, widgetIds) => set((s) => duplicateWidgetsIn(s, pageId, widgetIds)),
  reorderWidget: (pageId, widgetId, direction) =>
    set((s) => reorderWidgetIn(s, pageId, widgetId, direction)),
  removeWidget: (pageId, widgetId) => set((s) => removeWidgetFrom(s, pageId, widgetId)),
  updateWidget: (pageId, widgetId, patch) => set((s) => updateWidgetIn(s, pageId, widgetId, patch)),
  moveWidget: (pageId, widgetId, layout) => set((s) => moveWidgetIn(s, pageId, widgetId, layout)),
  commitWidgetMove: (pageId, widgetId, layout) =>
    set((s) => commitWidgetMoveIn(s, pageId, widgetId, layout)),
  moveWidgets: (pageId, moves) => set((s) => moveWidgetsIn(s, pageId, moves)),
  resolveWidgetCollisions: (pageId, widgetId) =>
    set((s) => resolveCollisionsIn(s, pageId, widgetId)),
  beginDrag: (pageId, widgetIds) => set((s) => beginDragIn(s, pageId, widgetIds)),
})
