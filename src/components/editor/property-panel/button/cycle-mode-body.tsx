import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MAX_CYCLE_STATES, MIN_CYCLE_STATES } from '@canshift/core'

import type { ConfigFieldsProps } from '../shared'
import { CycleStateRow } from './cycle-state-row'
import { defaultNavigateAction, type CycleConfig, type CycleState } from './shared'
import { withNewState, withoutState } from './cycle-states'
import { replaceAt } from '../../../../utils/list-edits'

const SECTION_LABEL = 'text-[10px] uppercase tracking-[0.06em] text-brand-neutral-600'

const addStateButton = cva('mt-0.5 border border-solid bg-transparent px-2.5 py-1 text-[11px]', {
  variants: {
    enabled: {
      true: 'cursor-pointer border-[#7788CC44] text-[#7788CC]',
      false: 'cursor-not-allowed border-brand-neutral-300 text-brand-neutral-500',
    },
  },
  defaultVariants: { enabled: true },
})

interface CycleModeBodyProps {
  cfg: CycleConfig
  pageIds: string[]
  onChange: ConfigFieldsProps['onChange']
}

const CycleHeader = ({ count }: { count: number }) => (
  <div className="mb-[5px] mt-1 flex items-baseline gap-2">
    <div className={SECTION_LABEL}>Cycle states</div>
    <div className="text-[10px] text-brand-neutral-500">
      {count} / {MAX_CYCLE_STATES}
    </div>
  </div>
)

const AddStateButton = ({ cfg, pageIds, onChange }: CycleModeBodyProps) => {
  const canAdd = cfg.states.length < MAX_CYCLE_STATES
  return (
    <button
      onClick={() => {
        const next = withNewState(cfg, defaultNavigateAction(pageIds))
        if (next) onChange({ config: next })
      }}
      disabled={!canAdd}
      className={cn(addStateButton({ enabled: canAdd }))}
    >
      + Add state
    </button>
  )
}

const stateHandlers = ({ cfg, onChange }: CycleModeBodyProps, idx: number) => ({
  onUpdate: (updated: CycleState) => {
    onChange({ config: { ...cfg, states: replaceAt(cfg.states, idx, updated) } })
  },
  onRemove: () => {
    const next = withoutState(cfg, idx)
    if (next) onChange({ config: next })
  },
  onSetInitial: () => {
    onChange({ config: { ...cfg, initialActiveIndex: idx } })
  },
})

export const CycleModeBody = (props: CycleModeBodyProps) => {
  const { cfg, pageIds } = props
  const canRemove = cfg.states.length > MIN_CYCLE_STATES
  return (
    <>
      <CycleHeader count={cfg.states.length} />
      {cfg.states.map((state, idx) => (
        <CycleStateRow
          key={idx}
          state={state}
          index={idx}
          isInitial={idx === cfg.initialActiveIndex}
          canRemove={canRemove}
          pageIds={pageIds}
          {...stateHandlers(props, idx)}
        />
      ))}
      <AddStateButton {...props} />
    </>
  )
}
