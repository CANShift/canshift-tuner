import { SHIFT_LIGHT_SEGMENT_COUNT } from '@canshift/core'
import { ConfigFieldsProps } from './shared'
import { PanelField, PanelInput, PanelRow } from '@/components/ui/form-field'

export const ShiftLightFields = ({ widget, onChange }: ConfigFieldsProps) => {
  if (widget.config.type !== 'shift_light') return null
  const cfg = widget.config

  return (
    <PanelRow>
      <PanelField label="First segment at">
        <PanelInput
          type="number"
          value={cfg.startValue}
          min={0}
          onChange={(e) => {
            const startValue = Math.max(0, Number(e.target.value))
            onChange({ config: { ...cfg, startValue } })
          }}
        />
      </PanelField>
      <PanelField label="Red segments">
        <PanelInput
          type="number"
          value={cfg.redSegments}
          min={0}
          max={SHIFT_LIGHT_SEGMENT_COUNT}
          onChange={(e) => {
            const raw = Math.round(Number(e.target.value))
            const redSegments = Math.min(SHIFT_LIGHT_SEGMENT_COUNT, Math.max(0, raw))
            onChange({ config: { ...cfg, redSegments } })
          }}
        />
      </PanelField>
    </PanelRow>
  )
}
