import type { ButtonAction } from '@canshift/core'

import { IconTrash } from '../../../icons/Icon'
import { ActionEditor } from './action-editor'
import { ACTION_CATEGORY_COLORS, ACTION_TYPE_LABELS } from './action-labels'

const CARD = [
  'mb-[5px] border border-solid border-brand-neutral-300 bg-brand-neutral-100 px-2 py-1.5',
].join(' ')

const CATEGORY = 'text-[10px] font-semibold uppercase tracking-wider'

const REMOVE_BUTTON = 'flex cursor-pointer border-none bg-transparent p-0 text-[#553333]'

interface ActionRowProps {
  action: ButtonAction
  pageIds: string[]
  onUpdate: (updated: ButtonAction) => void
  onRemove: () => void
}

const ActionHeader = ({ action, onRemove }: Pick<ActionRowProps, 'action' | 'onRemove'>) => (
  <div className="mb-[5px] flex items-center justify-between">
    <span
      className={CATEGORY}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ color: ACTION_CATEGORY_COLORS[action.category] }}
    >
      {action.category} — {ACTION_TYPE_LABELS[action.type]}
    </span>
    <button
      type="button"
      onClick={onRemove}
      className={REMOVE_BUTTON}
      title="Remove action"
      aria-label="Remove action"
    >
      <IconTrash size={11} color="#553333" />
    </button>
  </div>
)

export const ActionRow = ({ action, pageIds, onUpdate, onRemove }: ActionRowProps) => (
  <div className={CARD}>
    <ActionHeader action={action} onRemove={onRemove} />
    <ActionEditor action={action} pageIds={pageIds} onUpdate={onUpdate} />
  </div>
)
