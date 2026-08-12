import type { ButtonAction } from '@canshift/core'

import { IconTrash } from '../../../icons/Icon'
import { ActionEditor } from './action-editor'

const CARD = [
  'mb-[5px] border border-solid border-brand-neutral-300 bg-brand-neutral-100 px-2 py-1.5',
].join(' ')

const CATEGORY = 'text-[10px] font-semibold uppercase tracking-[0.05em]'

const REMOVE_BUTTON = 'flex cursor-pointer border-none bg-transparent p-0 text-[#553333]'

interface ActionRowProps {
  action: ButtonAction
  pageIds: string[]
  onUpdate: (updated: ButtonAction) => void
  onRemove: () => void
}

export const ActionRow = ({ action, pageIds, onUpdate, onRemove }: ActionRowProps) => {
  const typeLabel =
    action.type === 'navigate'
      ? 'Navigate'
      : action.type === 'map_switch'
        ? 'Map Switch'
        : action.type === 'can_raw'
          ? 'CAN Raw'
          : 'Cruise Ctrl'

  const categoryColor = action.category === 'ecu' ? '#CC8800' : '#5577CC'

  return (
    <div className={CARD}>
      <div className="mb-[5px] flex items-center justify-between">
        <span
          className={CATEGORY}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: categoryColor }}
        >
          {action.category} — {typeLabel}
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
      <ActionEditor action={action} pageIds={pageIds} onUpdate={onUpdate} />
    </div>
  )
}
