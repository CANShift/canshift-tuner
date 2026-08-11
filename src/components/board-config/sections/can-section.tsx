import { CAN_CONTROLLERS, type CanController, type CanProfile } from '@canshift/core'
import { NumberField, Section, SelectField } from '@/components/ui/form-field'

export interface CanSectionProps {
  can: CanProfile
  onPatch: (partial: Partial<CanProfile>) => void
}

export const CanSection = ({ can, onPatch }: CanSectionProps) => (
  <Section title="CAN">
    <SelectField
      label="Controller"
      value={can.controller}
      options={CAN_CONTROLLERS}
      onChange={(v) => {
        onPatch({ controller: v as CanController })
      }}
    />
    <NumberField
      label="TX pin"
      value={can.pinTx}
      onChange={(v) => {
        onPatch({ pinTx: v })
      }}
    />
    <NumberField
      label="RX pin"
      value={can.pinRx}
      onChange={(v) => {
        onPatch({ pinRx: v })
      }}
    />
    <NumberField
      label="Default speed (kbps)"
      value={can.defaultSpeedKbps}
      onChange={(v) => {
        onPatch({ defaultSpeedKbps: v })
      }}
    />
  </Section>
)
