import type { StorageProfile } from '@canshift/core'
import { Section } from '@/components/ui/form-field'
import { SectionFields, type FieldSpec } from './section-fields'

export interface StorageSectionProps {
  storage: StorageProfile
  onPatch: (partial: Partial<StorageProfile>) => void
}

const STORAGE_FIELDS: readonly FieldSpec<StorageProfile>[] = [
  { kind: 'bool', key: 'spiffsPresent', label: 'SPIFFS present' },
  { kind: 'number', key: 'spiffsSizeKb', label: 'SPIFFS size (KB)' },
  { kind: 'bool', key: 'sdPresent', label: 'SD present' },
  { kind: 'number', key: 'sdPinCs', label: 'SD CS pin' },
]

export const StorageSection = ({ storage, onPatch }: StorageSectionProps) => (
  <Section title="Storage">
    <SectionFields value={storage} fields={STORAGE_FIELDS} onPatch={onPatch} />
  </Section>
)
