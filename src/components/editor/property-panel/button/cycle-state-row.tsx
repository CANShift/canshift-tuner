import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MIN_CYCLE_STATES } from '@canshift/core'

import { IconTrash } from '../../../icons/Icon'
import { PanelInput } from '@/components/ui/form-field'
import { ActionEditor } from './action-editor'
import { ActionTypeMenu } from './action-type-menu'
import type { CycleState } from './shared'

const card = cva('mb-[5px] border border-solid px-2 py-1.5', {
  variants: {
    initial: {
      true: 'border-[color-mix(in_srgb,#7788CC_30%,transparent)] bg-[color-mix(in_srgb,#7788CC_14%,transparent)]',
      false: 'border-brand-neutral-300 bg-brand-neutral-100',
    },
  },
  defaultVariants: { initial: false },
})

const ROW = 'mb-[5px] flex items-center gap-1.5'

const initialLabel = cva('flex cursor-pointer items-center gap-1 text-[10px]', {
  variants: { initial: { true: 'text-[#7788CC]', false: 'text-brand-neutral-500' } },
  defaultVariants: { initial: false },
})

const removeButton = cva('flex border-none bg-transparent p-0', {
  variants: {
    enabled: {
      true: 'cursor-pointer text-[#553333]',
      false: 'cursor-not-allowed text-brand-neutral-300',
    },
  },
  defaultVariants: { enabled: true },
})

const CATEGORY = 'text-[9px] font-semibold uppercase tracking-[0.05em]'

interface CycleStateRowProps {
  state: CycleState
  index: number
  isInitial: boolean
  canRemove: boolean
  pageIds: string[]
  onUpdate: (updated: CycleState) => void
  onRemove: () => void
  onSetInitial: () => void
}

export const CycleStateRow = ({
  state,
  index,
  isInitial,
  canRemove,
  pageIds,
  onUpdate,
  onRemove,
  onSetInitial,
}: CycleStateRowProps) => {
  const typeLabel =
    state.action.type === 'navigate'
      ? 'Navigate'
      : state.action.type === 'map_switch'
        ? 'Map Switch'
        : state.action.type === 'can_raw'
          ? 'CAN Raw'
          : 'Cruise Ctrl'
  const categoryColor = state.action.category === 'ecu' ? '#CC8800' : '#5577CC'

  return (
    <div className={cn(card({ initial: isInitial }))}>
      <div className={ROW}>
        <span className="min-w-4 text-[10px] text-brand-neutral-500">{index + 1}</span>
        <PanelInput
          className="flex-1 text-[11px]"
          value={state.label}
          placeholder={`State ${String(index + 1)}`}
          onChange={(e) => {
            onUpdate({ ...state, label: e.target.value })
          }}
        />
        <label className={cn(initialLabel({ initial: isInitial }))} title="Active on load">
          <input
            type="radio"
            checked={isInitial}
            onChange={onSetInitial}
            className="cursor-pointer accent-[#7788CC]"
          />
          Initial
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Remove state"
          className={cn(removeButton({ enabled: canRemove }))}
          title={canRemove ? 'Remove state' : `Need at least ${String(MIN_CYCLE_STATES)} states`}
        >
          <IconTrash size={11} color={canRemove ? '#553333' : 'hsl(var(--brand-neutral-300))'} />
        </button>
      </div>
      <div className={ROW}>
        <span
          className={CATEGORY}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: categoryColor }}
        >
          {state.action.category} — {typeLabel}
        </span>
        <ActionTypeMenu
          pageIds={pageIds}
          onSelect={(action) => {
            onUpdate({ ...state, action })
          }}
        />
      </div>
      <ActionEditor
        action={state.action}
        pageIds={pageIds}
        onUpdate={(action) => {
          onUpdate({ ...state, action })
        }}
      />
    </div>
  )
}
