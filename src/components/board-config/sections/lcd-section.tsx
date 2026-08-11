import { LCD_DRIVERS, type LcdDriver, type LcdProfile } from '@canshift/core'
import { BoolField, NumberField, Section, SelectField } from '@/components/ui/form-field'

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]
type BoolKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T]

const NUMBER_FIELDS: { key: NumericKeys<LcdProfile>; label: string }[] = [
  { key: 'pinMosi', label: 'MOSI' },
  { key: 'pinMiso', label: 'MISO' },
  { key: 'pinSclk', label: 'SCLK' },
  { key: 'pinCs', label: 'CS' },
  { key: 'pinDc', label: 'DC' },
  { key: 'pinRst', label: 'RST' },
  { key: 'pinBl', label: 'Backlight pin' },
  { key: 'freqWriteHz', label: 'Write freq (Hz)' },
  { key: 'panelWidth', label: 'Panel width' },
  { key: 'panelHeight', label: 'Panel height' },
  { key: 'memoryWidth', label: 'Memory width' },
  { key: 'memoryHeight', label: 'Memory height' },
  { key: 'defaultRotation', label: 'Rotation' },
  { key: 'colorDepth', label: 'Color depth' },
]

const BOOL_FIELDS: { key: BoolKeys<LcdProfile>; label: string }[] = [
  { key: 'rgbOrderBgr', label: 'BGR order' },
  { key: 'invert', label: 'Invert' },
  { key: 'busSharedWithTouch', label: 'Bus shared with touch' },
  { key: 'readable', label: 'Readable' },
]

export interface LcdSectionProps {
  lcd: LcdProfile
  onPatch: (partial: Partial<LcdProfile>) => void
}

export const LcdSection = ({ lcd, onPatch }: LcdSectionProps) => (
  <Section title="LCD">
    <SelectField
      label="Driver"
      value={lcd.driver}
      options={LCD_DRIVERS}
      onChange={(v) => {
        onPatch({ driver: v as LcdDriver })
      }}
    />
    {NUMBER_FIELDS.map(({ key, label }) => (
      <NumberField
        key={key}
        label={label}
        value={lcd[key]}
        onChange={(v) => {
          onPatch({ [key]: v } as Partial<LcdProfile>)
        }}
      />
    ))}
    {BOOL_FIELDS.map(({ key, label }) => (
      <BoolField
        key={key}
        label={label}
        value={lcd[key]}
        onChange={(v) => {
          onPatch({ [key]: v } as Partial<LcdProfile>)
        }}
      />
    ))}
  </Section>
)
