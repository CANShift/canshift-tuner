import type { DashboardConfig, PageConfig, SignalDef, Widget } from '@canshift/core'
import { SIGNAL_CONSUMING_TYPES } from './default-widget'
import { parseHexFrameId } from './frame-id'

export const isUnboundWidget = (widget: Widget): boolean =>
  SIGNAL_CONSUMING_TYPES.has(widget.type) && widget.signal === ''

const isReadable = (signal: SignalDef): boolean =>
  parseHexFrameId(signal.canFrameId) >= 0 || signal.polling !== undefined

export interface PlacedWidget {
  page: PageConfig
  widget: Widget
}

const readsNothing = (widget: Widget, readable: ReadonlySet<string>): boolean =>
  SIGNAL_CONSUMING_TYPES.has(widget.type) && (widget.signal === '' || !readable.has(widget.signal))

export const unreadableWidgets = (
  config: DashboardConfig | null,
  signals: readonly SignalDef[]
): PlacedWidget[] => {
  const readable = new Set(signals.filter(isReadable).map((signal) => signal.name))
  return (config?.pages ?? []).flatMap((page) =>
    page.widgets
      .filter((widget) => readsNothing(widget, readable))
      .map((widget) => ({ page, widget }))
  )
}
