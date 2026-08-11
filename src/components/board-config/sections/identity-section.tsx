import {
  BOARD_ID_MAX_LEN,
  BOARD_NAME_MAX_LEN,
  CHIP_FAMILIES,
  type BoardProfile,
  type ChipFamily,
} from '@canshift/core'
import { Section, SelectField, TextField } from '@/components/ui/form-field'

export interface IdentitySectionProps {
  draft: BoardProfile
  onPatch: (partial: Partial<BoardProfile>) => void
}

export const IdentitySection = ({ draft, onPatch }: IdentitySectionProps) => (
  <Section title="Identity">
    <TextField
      label="Board id"
      value={draft.boardId}
      maxLength={BOARD_ID_MAX_LEN}
      onChange={(v) => {
        onPatch({ boardId: v })
      }}
    />
    <TextField
      label="Board name"
      value={draft.boardName}
      maxLength={BOARD_NAME_MAX_LEN}
      onChange={(v) => {
        onPatch({ boardName: v })
      }}
    />
    <SelectField
      label="Chip family"
      value={draft.chipFamily}
      options={CHIP_FAMILIES}
      onChange={(v) => {
        onPatch({ chipFamily: v as ChipFamily })
      }}
    />
  </Section>
)
