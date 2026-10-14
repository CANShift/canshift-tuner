import type { DashboardConfig, Widget } from '@canshift/core'
import { isSpanOverflowing } from '@canshift/core'

export interface OverflowingWidget {
  pageId: string
  widgetId: string
  type: Widget['type']
  layout: Widget['layout']
}

export const detectOverflow = (config: DashboardConfig): OverflowingWidget[] =>
  config.pages.flatMap((page) =>
    page.widgets
      .filter((widget) => isSpanOverflowing(widget.layout))
      .map((widget) => ({
        pageId: page.id,
        widgetId: widget.id,
        type: widget.type,
        layout: widget.layout,
      }))
  )
