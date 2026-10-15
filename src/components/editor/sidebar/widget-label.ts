import type { Widget } from '@canshift/core'
import { authoredKicker, derivedKicker } from '../../../lib/widget-kicker'

const unauthoredLabel = (widget: Widget): string => {
  if (widget.config.type === 'button') return widget.config.label
  if (widget.signal.length > 0) return derivedKicker(widget)
  return widget.type.toUpperCase()
}

export const widgetLabel = (widget: Widget): string =>
  authoredKicker(widget) ?? unauthoredLabel(widget)
