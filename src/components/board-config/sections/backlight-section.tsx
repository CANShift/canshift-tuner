import type { BacklightProfile } from '@canshift/core'
import { Section } from '@/components/ui/form-field'
import { SectionFields, type FieldSpec } from './section-fields'

export interface BacklightSectionProps {
  backlight: BacklightProfile
  onPatch: (partial: Partial<BacklightProfile>) => void
}

const BACKLIGHT_FIELDS: readonly FieldSpec<BacklightProfile>[] = [
  { kind: 'bool', key: 'present', label: 'Present' },
  { kind: 'bool', key: 'invert', label: 'Invert' },
  { kind: 'number', key: 'pwmChannel', label: 'PWM channel' },
  { kind: 'number', key: 'pwmFreqHz', label: 'PWM freq (Hz)' },
  { kind: 'number', key: 'defaultDuty', label: 'Default duty' },
]

export const BacklightSection = ({ backlight, onPatch }: BacklightSectionProps) => (
  <Section title="Backlight">
    <SectionFields value={backlight} fields={BACKLIGHT_FIELDS} onPatch={onPatch} />
  </Section>
)
