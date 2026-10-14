import { describe, expect, it } from 'vitest'
import { MAX_CYCLE_STATES } from '@canshift/core'
import type { CycleConfig } from './shared'
import { withNewState, withoutState } from './cycle-states'
import { replaceAt } from '../../../../utils/list-edits'

const action = { type: 'navigate', category: 'dashboard', pageId: 'p1' } as const
const state = (label: string) => ({ label, action })
const cycle = (count: number, initialActiveIndex = 0) =>
  ({
    type: 'button',
    mode: 'cycle',
    label: 'B',
    initialActiveIndex,
    states: Array.from({ length: count }, (_, i) => state(`S${String(i + 1)}`)),
  }) as unknown as CycleConfig

describe('cycle state edits', () => {
  it('replaces one item in place', () => {
    expect(replaceAt([1, 2, 3], 1, 9)).toEqual([1, 9, 3])
  })

  it('refuses to drop below the minimum and clamps the initial state', () => {
    expect(withoutState(cycle(2), 0)).toBeNull()
    expect(withoutState(cycle(3, 2), 2)?.initialActiveIndex).toBe(1)
  })

  it('appends a numbered state up to the maximum', () => {
    expect(withNewState(cycle(2), action)?.states[2]?.label).toBe('State 3')
    expect(withNewState(cycle(MAX_CYCLE_STATES), action)).toBeNull()
  })
})
