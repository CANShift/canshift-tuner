import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MAX_CYCLE_STATES, MIN_CYCLE_STATES } from '@canshift/core'

import type { ConfigFieldsProps } from '../shared'
import { CycleStateRow } from './cycle-state-row'
import { defaultNavigateAction, type CycleConfig, type CycleState } from './shared'

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

export const CycleModeBody = ({ cfg, pageIds, onChange }: CycleModeBodyProps) => {
  const updateState = (idx: number, updated: CycleState) => {
    const next = cfg.states.map((s, i) => (i === idx ? updated : s))
    onChange({ config: { ...cfg, states: next } })
  }

  const removeState = (idx: number) => {
    if (cfg.states.length <= MIN_CYCLE_STATES) return
    const next = cfg.states.filter((_, i) => i !== idx)
    const nextInitial =
      cfg.initialActiveIndex >= next.length ? next.length - 1 : cfg.initialActiveIndex
    onChange({ config: { ...cfg, states: next, initialActiveIndex: nextInitial } })
  }

  const addState = () => {
    if (cfg.states.length >= MAX_CYCLE_STATES) return
    const next: CycleState = {
      label: `State ${String(cfg.states.length + 1)}`,
      action: defaultNavigateAction(pageIds),
    }
    onChange({ config: { ...cfg, states: [...cfg.states, next] } })
  }

  const setInitial = (idx: number) => {
    onChange({ config: { ...cfg, initialActiveIndex: idx } })
  }

  const canAdd = cfg.states.length < MAX_CYCLE_STATES
  const canRemove = cfg.states.length > MIN_CYCLE_STATES

  return (
    <>
      <div className="mb-[5px] mt-1 flex items-baseline gap-2">
        <div className={SECTION_LABEL}>Cycle states</div>
        <div className="text-[10px] text-brand-neutral-500">
          {cfg.states.length} / {MAX_CYCLE_STATES}
        </div>
      </div>

      {cfg.states.map((state, idx) => (
        <CycleStateRow
          key={idx}
          state={state}
          index={idx}
          isInitial={idx === cfg.initialActiveIndex}
          canRemove={canRemove}
          pageIds={pageIds}
          onUpdate={(updated) => {
            updateState(idx, updated)
          }}
          onRemove={() => {
            removeState(idx)
          }}
          onSetInitial={() => {
            setInitial(idx)
          }}
        />
      ))}

      <button
        onClick={addState}
        disabled={!canAdd}
        className={cn(addStateButton({ enabled: canAdd }))}
      >
        + Add state
      </button>
    </>
  )
}
