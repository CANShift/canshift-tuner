import type { GaugeDisplayStyle, SignalDef, Widget } from '@canshift/core'
import type { WidgetPatch } from '../../../lib/widget-patch'

export interface ConfigFieldsProps {
  widget: Widget
  onChange: (patch: WidgetPatch) => void
  signalDef?: SignalDef | undefined
}

export const GAUGE_STYLES: { value: GaugeDisplayStyle; label: string }[] = [
  { value: 'arc', label: 'Arc' },
  { value: 'numeric', label: 'Numeric' },
]
