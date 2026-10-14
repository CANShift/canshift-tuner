import { LCD_DRIVERS, type LcdDriver, type LcdProfile } from '@canshift/core'
import { Section, SelectField } from '@/components/ui/form-field'
import { SectionFields, type FieldSpec } from './section-fields'

const LCD_FIELDS: readonly FieldSpec<LcdProfile>[] = [
  { kind: 'number', key: 'pinMosi', label: 'MOSI' },
  { kind: 'number', key: 'pinMiso', label: 'MISO' },
  { kind: 'number', key: 'pinSclk', label: 'SCLK' },
  { kind: 'number', key: 'pinCs', label: 'CS' },
  { kind: 'number', key: 'pinDc', label: 'DC' },
  { kind: 'number', key: 'pinRst', label: 'RST' },
  { kind: 'number', key: 'pinBl', label: 'Backlight pin' },
  { kind: 'number', key: 'freqWriteHz', label: 'Write freq (Hz)' },
  { kind: 'number', key: 'panelWidth', label: 'Panel width' },
  { kind: 'number', key: 'panelHeight', label: 'Panel height' },
  { kind: 'number', key: 'memoryWidth', label: 'Memory width' },
  { kind: 'number', key: 'memoryHeight', label: 'Memory height' },
  { kind: 'number', key: 'defaultRotation', label: 'Rotation' },
  { kind: 'number', key: 'colorDepth', label: 'Color depth' },
  { kind: 'bool', key: 'rgbOrderBgr', label: 'BGR order' },
  { kind: 'bool', key: 'invert', label: 'Invert' },
  { kind: 'bool', key: 'busSharedWithTouch', label: 'Bus shared with touch' },
  { kind: 'bool', key: 'readable', label: 'Readable' },
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
    <SectionFields value={lcd} fields={LCD_FIELDS} onPatch={onPatch} />
  </Section>
)
