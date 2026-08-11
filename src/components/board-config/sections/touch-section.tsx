import { TOUCH_DRIVERS, type TouchDriver, type TouchProfile } from '@canshift/core'
import { BoolField, NumberField, Section, SelectField } from '@/components/ui/form-field'

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]

const NUMBER_FIELDS: { key: NumericKeys<TouchProfile>; label: string }[] = [
  { key: 'pinCs', label: 'CS' },
  { key: 'pinIrq', label: 'IRQ' },
  { key: 'pinSda', label: 'SDA' },
  { key: 'pinScl', label: 'SCL' },
  { key: 'freqHz', label: 'Freq (Hz)' },
]

export interface TouchSectionProps {
  touch: TouchProfile
  onPatch: (partial: Partial<TouchProfile>) => void
}

export const TouchSection = ({ touch, onPatch }: TouchSectionProps) => (
  <Section title="Touch">
    <SelectField
      label="Driver"
      value={touch.driver}
      options={TOUCH_DRIVERS}
      onChange={(v) => {
        onPatch({ driver: v as TouchDriver })
      }}
    />
    {NUMBER_FIELDS.map(({ key, label }) => (
      <NumberField
        key={key}
        label={label}
        value={touch[key]}
        onChange={(v) => {
          onPatch({ [key]: v } as Partial<TouchProfile>)
        }}
      />
    ))}
    <BoolField
      label="Needs calibration"
      value={touch.needsCalibration}
      onChange={(v) => {
        onPatch({ needsCalibration: v })
      }}
    />
  </Section>
)
