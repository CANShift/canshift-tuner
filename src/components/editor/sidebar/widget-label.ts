import type { Widget } from '@canshift/core'
import { displayLabelForSignal } from '../../../utils/signal-labels'

export const widgetLabel = (widget: Widget): string => {
  if (widget.config.type === 'button') return widget.config.kicker ?? widget.config.label
  if (widget.signal.length > 0) return displayLabelForSignal(widget.signal).toUpperCase()
  return widget.type.toUpperCase()
}
