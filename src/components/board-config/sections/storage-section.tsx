import type { StorageProfile } from '@canshift/core'
import { BoolField, NumberField, Section } from '@/components/ui/form-field'

export interface StorageSectionProps {
  storage: StorageProfile
  onPatch: (partial: Partial<StorageProfile>) => void
}

export const StorageSection = ({ storage, onPatch }: StorageSectionProps) => (
  <Section title="Storage">
    <BoolField
      label="SPIFFS present"
      value={storage.spiffsPresent}
      onChange={(v) => {
        onPatch({ spiffsPresent: v })
      }}
    />
    <NumberField
      label="SPIFFS size (KB)"
      value={storage.spiffsSizeKb}
      onChange={(v) => {
        onPatch({ spiffsSizeKb: v })
      }}
    />
    <BoolField
      label="SD present"
      value={storage.sdPresent}
      onChange={(v) => {
        onPatch({ sdPresent: v })
      }}
    />
    <NumberField
      label="SD CS pin"
      value={storage.sdPinCs}
      onChange={(v) => {
        onPatch({ sdPinCs: v })
      }}
    />
  </Section>
)
