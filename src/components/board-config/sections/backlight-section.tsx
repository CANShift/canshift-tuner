import type { BacklightProfile } from '@canshift/core'
import { BoolField, NumberField, Section } from '@/components/ui/form-field'

export interface BacklightSectionProps {
  backlight: BacklightProfile
  onPatch: (partial: Partial<BacklightProfile>) => void
}

export const BacklightSection = ({ backlight, onPatch }: BacklightSectionProps) => (
  <Section title="Backlight">
    <BoolField
      label="Present"
      value={backlight.present}
      onChange={(v) => {
        onPatch({ present: v })
      }}
    />
    <BoolField
      label="Invert"
      value={backlight.invert}
      onChange={(v) => {
        onPatch({ invert: v })
      }}
    />
    <NumberField
      label="PWM channel"
      value={backlight.pwmChannel}
      onChange={(v) => {
        onPatch({ pwmChannel: v })
      }}
    />
    <NumberField
      label="PWM freq (Hz)"
      value={backlight.pwmFreqHz}
      onChange={(v) => {
        onPatch({ pwmFreqHz: v })
      }}
    />
    <NumberField
      label="Default duty"
      value={backlight.defaultDuty}
      onChange={(v) => {
        onPatch({ defaultDuty: v })
      }}
    />
  </Section>
)
