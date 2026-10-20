import type { ComponentType } from 'react'
import type { PageConfig } from '@canshift/core'
import { CompactSelect, PanelField } from '@/components/ui/form-field'
import { STRINGS } from '../../strings'
import {
  STATUS_ITEM_KINDS,
  defaultStatusItem,
  isStatusItem,
  type StatusItem,
  type StatusItemKind,
  type StatusSlot,
} from '../../lib/status-row'
import { useDashboardStore } from '../../stores/dashboard.store'
import { StatusFlagFields, StatusTimerFields } from './StatusTimingFields'
import { StatusValueFields } from './StatusValueFields'

const S = STRINGS.statusRow

const SLOT_LABELS: Record<StatusSlot, string> = { center: S.center, right: S.right }

const KIND_OPTIONS = [
  { value: '', label: S.barDefault },
  ...STATUS_ITEM_KINDS.map((value) => ({ value, label: S.kinds[value] })),
]

interface FieldsProps {
  item: StatusItem
  onChange: (item: StatusItem) => void
}

const asFields = <T extends StatusItem>(
  Fields: ComponentType<{ item: T; onChange: (item: T) => void }>
): ComponentType<FieldsProps> => Fields as unknown as ComponentType<FieldsProps>

const KIND_FIELDS: Record<StatusItemKind, ComponentType<FieldsProps>> = {
  signal: asFields(StatusValueFields),
  signalMax: asFields(StatusValueFields),
  timer: asFields(StatusTimerFields),
  flagWord: asFields(StatusFlagFields),
}

export interface StatusSlotEditorProps {
  page: PageConfig
  slot: StatusSlot
}

export const StatusSlotEditor = ({ page, slot }: StatusSlotEditorProps) => {
  const setStatusItem = useDashboardStore((s) => s.setStatusItem)
  const current = page.statusRow?.[slot]
  const item = isStatusItem(current) ? current : undefined
  const save = (next: StatusItem | null) => {
    setStatusItem(page.id, slot, next)
  }
  const Fields = item ? KIND_FIELDS[item.type] : null
  return (
    <section className="rounded-[12px] border border-app-border bg-app-bg p-3.5">
      <h3 className="mb-2 text-[15px] font-semibold">{SLOT_LABELS[slot]}</h3>
      <PanelField label={S.kind}>
        <CompactSelect
          value={item?.type ?? ''}
          options={KIND_OPTIONS}
          ariaLabel={`${SLOT_LABELS[slot]} ${S.kind}`}
          onChange={(kind) => {
            save(kind === '' ? null : defaultStatusItem(kind as StatusItemKind, slot))
          }}
        />
      </PanelField>
      {item && Fields && <Fields item={item} onChange={save} />}
    </section>
  )
}
