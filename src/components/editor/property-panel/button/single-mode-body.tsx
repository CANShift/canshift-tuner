import type { ButtonAction, SingleActionButtonConfig } from '@canshift/core'

import { actionKey } from '../../../../utils/list-keys'
import { newId } from '../../../../utils/id'
import { Switch } from '@/components/ui/switch'
import { type ConfigFieldsProps } from '../shared'
import { PanelField } from '@/components/ui/form-field'
import { ActionRow } from './action-row'
import { AddActionMenu } from './add-action-menu'

interface SingleModeBodyProps {
  cfg: SingleActionButtonConfig
  pageIds: string[]
  onChange: ConfigFieldsProps['onChange']
}

export const SingleModeBody = ({ cfg, pageIds, onChange }: SingleModeBodyProps) => {
  const updateAction = (idx: number, updated: ButtonAction) => {
    const next = cfg.actions.map((a, i) => (i === idx ? updated : a))
    onChange({ config: { ...cfg, actions: next } })
  }

  const removeAction = (idx: number) => {
    onChange({ config: { ...cfg, actions: cfg.actions.filter((_, i) => i !== idx) } })
  }

  const addAction = (action: ButtonAction) => {
    const withId: ButtonAction = action.id !== undefined ? action : { ...action, id: newId() }
    onChange({ config: { ...cfg, actions: [...cfg.actions, withId] } })
  }

  return (
    <>
      <PanelField label="Behaviour">
        <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-brand-neutral-600">
          <Switch
            checked={cfg.isToggle === true}
            onCheckedChange={(checked) => {
              onChange({ config: { ...cfg, isToggle: checked } })
            }}
          />
          Toggle (stays active after press)
        </label>
      </PanelField>

      <div className="mb-[5px] mt-1 text-[10px] uppercase tracking-[0.06em] text-brand-neutral-600">
        Actions
      </div>

      {cfg.actions.length === 0 && (
        <div className="mb-1.5 text-[11px] text-brand-neutral-600">No actions yet.</div>
      )}

      {cfg.actions.map((action, idx) => (
        <ActionRow
          key={actionKey(action)}
          action={action}
          pageIds={pageIds}
          onUpdate={(updated) => {
            updateAction(idx, updated)
          }}
          onRemove={() => {
            removeAction(idx)
          }}
        />
      ))}

      <AddActionMenu pageIds={pageIds} onAdd={addAction} />
    </>
  )
}
