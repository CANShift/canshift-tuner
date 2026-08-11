import type { GaugeDisplayStyle, SignalDef, Widget } from '@canshift/core'

export interface ConfigFieldsProps {
  widget: Widget
  onChange: (patch: Partial<Widget>) => void
  signalDef?: SignalDef | undefined
}

export const GAUGE_STYLES: { value: GaugeDisplayStyle; label: string }[] = [
  { value: 'arc', label: 'Arc' },
  { value: 'numeric', label: 'Numeric' },
]
