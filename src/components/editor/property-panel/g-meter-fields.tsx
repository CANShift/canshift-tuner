import { G_METER_RANGE_G } from '@canshift/core'
import { Checkbox } from '@/components/ui/checkbox'
import { CompactSelect, PanelField } from '@/components/ui/form-field'
import { useBoardLacksImu } from '../../../hooks/useBoardLacksImu'
import { ConfigFieldsProps } from './shared'

const RANGE_STEP_G = 0.5

const RANGE_OPTIONS = Array.from(
  { length: (G_METER_RANGE_G.max - G_METER_RANGE_G.min) / RANGE_STEP_G + 1 },
  (_, i) => {
    const value = G_METER_RANGE_G.min + i * RANGE_STEP_G
    return { value: String(value), label: `±${value.toFixed(1)} g` }
  }
)

const NO_IMU_NOTE = 'This board has no IMU — the dash shows the g-meter as unavailable.'

type GMeterConfig = Extract<ConfigFieldsProps['widget']['config'], { type: 'g_meter' }>

interface GMeterFieldProps {
  cfg: GMeterConfig
  onChange: ConfigFieldsProps['onChange']
}

const RangeField = ({ cfg, onChange }: GMeterFieldProps) => (
  <PanelField label="Full scale">
    <CompactSelect
      value={String(cfg.rangeG)}
      options={RANGE_OPTIONS}
      onChange={(next) => {
        onChange({ config: { ...cfg, rangeG: Number(next) } })
      }}
    />
  </PanelField>
)

const PeakHoldField = ({ cfg, onChange }: GMeterFieldProps) => (
  <PanelField label="Peak envelope">
    <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-brand-neutral-600">
      <Checkbox
        checked={cfg.peakHold !== false}
        onCheckedChange={(checked) => {
          onChange({ config: { ...cfg, peakHold: checked === true } })
        }}
      />
      Draw the highest grip used in each direction; tap the widget to clear it
    </label>
  </PanelField>
)

export const GMeterFields = ({ widget, onChange }: ConfigFieldsProps) => {
  const lacksImu = useBoardLacksImu()
  if (widget.config.type !== 'g_meter') return null
  const cfg = widget.config
  return (
    <>
      <RangeField cfg={cfg} onChange={onChange} />
      <PeakHoldField cfg={cfg} onChange={onChange} />
      {lacksImu && <p className="text-[12px] text-app-muted">{NO_IMU_NOTE}</p>}
    </>
  )
}
