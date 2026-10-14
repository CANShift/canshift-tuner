import type { ButtonAction, SingleActionButtonConfig } from '@canshift/core'

import { actionKey } from '../../../../utils/list-keys'
import { newId } from '../../../../utils/id'
import { Switch } from '@/components/ui/switch'
import { type ConfigFieldsProps } from '../shared'
import { PanelField } from '@/components/ui/form-field'
import { ActionRow } from './action-row'
import { AddActionMenu } from './add-action-menu'
import { removeAt, replaceAt } from '../../../../utils/list-edits'

interface SingleModeBodyProps {
  cfg: SingleActionButtonConfig
  pageIds: string[]
  onChange: ConfigFieldsProps['onChange']
}

const withId = (action: ButtonAction): ButtonAction =>
  action.id !== undefined ? action : { ...action, id: newId() }

const BehaviourField = ({ cfg, onChange }: Omit<SingleModeBodyProps, 'pageIds'>) => (
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
)

const ActionList = ({ cfg, pageIds, onChange }: SingleModeBodyProps) => (
  <>
    {cfg.actions.map((action, idx) => (
      <ActionRow
        key={actionKey(action)}
        action={action}
        pageIds={pageIds}
        onUpdate={(updated) => {
          onChange({ config: { ...cfg, actions: replaceAt(cfg.actions, idx, updated) } })
        }}
        onRemove={() => {
          onChange({ config: { ...cfg, actions: removeAt(cfg.actions, idx) } })
        }}
      />
    ))}
  </>
)

export const SingleModeBody = (props: SingleModeBodyProps) => {
  const { cfg, pageIds, onChange } = props
  return (
    <>
      <BehaviourField cfg={cfg} onChange={onChange} />
      <div className="mb-[5px] mt-1 text-[10px] uppercase tracking-[0.06em] text-brand-neutral-600">
        Actions
      </div>
      {cfg.actions.length === 0 && (
        <div className="mb-1.5 text-[11px] text-brand-neutral-600">No actions yet.</div>
      )}
      <ActionList {...props} />
      <AddActionMenu
        pageIds={pageIds}
        onAdd={(action) => {
          onChange({ config: { ...cfg, actions: [...cfg.actions, withId(action)] } })
        }}
      />
    </>
  )
}
