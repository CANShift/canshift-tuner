import { MAX_CYCLE_STATES, MIN_CYCLE_STATES, type ButtonAction } from '@canshift/core'
import type { CycleConfig, CycleState } from './shared'
import { removeAt } from '../../../../utils/list-edits'

export const withoutState = (cfg: CycleConfig, index: number): CycleConfig | null => {
  if (cfg.states.length <= MIN_CYCLE_STATES) return null
  const states = removeAt(cfg.states, index)
  const initialActiveIndex =
    cfg.initialActiveIndex >= states.length ? states.length - 1 : cfg.initialActiveIndex
  return { ...cfg, states, initialActiveIndex }
}

export const withNewState = (cfg: CycleConfig, action: ButtonAction): CycleConfig | null => {
  if (cfg.states.length >= MAX_CYCLE_STATES) return null
  const state: CycleState = { label: `State ${String(cfg.states.length + 1)}`, action }
  return { ...cfg, states: [...cfg.states, state] }
}
