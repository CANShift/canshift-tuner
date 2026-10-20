import {
  pageHasShiftStrip,
  resolvePageWidgetRect,
  type GridRect,
  type Widget,
} from '@canshift/core'

interface PageArea {
  width: number
  height: number
}

export const widgetRectOn = (
  page: { widgets: readonly Widget[] },
  widget: Widget,
  area: PageArea
): GridRect => resolvePageWidgetRect(widget, area, pageHasShiftStrip(page))
