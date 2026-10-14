import { CAN_CONTROLLERS, type CanController, type CanProfile } from '@canshift/core'
import { Section, SelectField } from '@/components/ui/form-field'
import { SectionFields, type FieldSpec } from './section-fields'

export interface CanSectionProps {
  can: CanProfile
  onPatch: (partial: Partial<CanProfile>) => void
}

const CAN_FIELDS: readonly FieldSpec<CanProfile>[] = [
  { kind: 'number', key: 'pinTx', label: 'TX pin' },
  { kind: 'number', key: 'pinRx', label: 'RX pin' },
  { kind: 'number', key: 'defaultSpeedKbps', label: 'Default speed (kbps)' },
]

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
    <SectionFields value={can} fields={CAN_FIELDS} onPatch={onPatch} />
  </Section>
)
