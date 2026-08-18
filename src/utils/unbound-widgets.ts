import type { DashboardConfig, SignalDef, Widget } from '@canshift/core'
import { SIGNAL_CONSUMING_TYPES } from './default-widget'
import { parseHexFrameId } from './frame-id'

export const isUnboundWidget = (widget: Widget): boolean =>
  SIGNAL_CONSUMING_TYPES.has(widget.type) && widget.signal === ''

const isReadable = (signal: SignalDef): boolean =>
  parseHexFrameId(signal.canFrameId) >= 0 || signal.polling !== undefined

export const unreadableWidgetCount = (
  config: DashboardConfig | null,
  signals: readonly SignalDef[]
): number => {
  const readable = new Set(signals.filter(isReadable).map((signal) => signal.name))
  return (
    config?.pages.reduce(
      (total, page) =>
        total +
        page.widgets.filter(
          (widget) =>
            SIGNAL_CONSUMING_TYPES.has(widget.type) &&
            (widget.signal === '' || !readable.has(widget.signal))
        ).length,
      0
    ) ?? 0
  )
}
