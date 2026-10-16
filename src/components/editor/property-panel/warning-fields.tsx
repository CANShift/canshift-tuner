import { ConfigFieldsProps } from './shared'
import { Checkbox } from '@/components/ui/checkbox'
import { PanelField, PanelInput, PanelRow } from '@/components/ui/form-field'

export const WarningFields = ({ widget, onChange }: ConfigFieldsProps) => {
  if (widget.config.type !== 'warning') return null
  const cfg = widget.config
  return (
    <PanelRow>
      <PanelField label="Lights at">
        <PanelInput
          type="number"
          value={cfg.threshold}
          onChange={(e) => {
            onChange({ config: { ...cfg, threshold: Number(e.target.value) } })
          }}
        />
      </PanelField>
      <PanelField label="Direction">
        <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-brand-neutral-600">
          <Checkbox
            checked={cfg.invertLogic === true}
            onCheckedChange={(checked) => {
              onChange({ config: { ...cfg, invertLogic: checked === true } })
            }}
          />
          Lights when the reading is below
        </label>
      </PanelField>
    </PanelRow>
  )
}
