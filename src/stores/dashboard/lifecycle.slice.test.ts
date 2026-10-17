import { describe, it, expect, beforeEach } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import { useDashboardStore } from '../dashboard.store'

const makeConfig = (id: string): DashboardConfig =>
  ({
    version: '1.23.0',
    defaultPageId: id,
    topBar: { height: 16, bgColor: '#000000', textColor: '#FFFFFF' },
    pages: [{ id, backgroundColor: '#000000', showTopBar: true, visible: true, widgets: [] }],
  }) as unknown as DashboardConfig

beforeEach(() => {
  useDashboardStore.setState({ config: null, past: [], future: [] })
})

describe('replaceConfig', () => {
  it('swaps the draft and keeps the previous one on the undo stack', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().replaceConfig(makeConfig('p2'), 'Undo a change')
    expect(useDashboardStore.getState().selectedPageId).toBe('p2')
    useDashboardStore.getState().undo()
    expect(useDashboardStore.getState().config?.defaultPageId).toBe('p1')
  })
})

describe('setCriticalAlert', () => {
  const alert = {
    signal: 'oil_press_bar',
    firesAt: 1,
    direction: 'below',
    acknowledgeOn: 'dash',
  } as const

  it('writes the alert onto the config', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setCriticalAlert(alert)
    const state = useDashboardStore.getState()
    expect(state.config?.criticalAlert).toEqual(alert)
  })

  it('removes the key entirely when cleared, so the config validates without it', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setCriticalAlert(alert)
    useDashboardStore.getState().setCriticalAlert(null)
    expect(useDashboardStore.getState().config).not.toHaveProperty('criticalAlert')
  })

  it('can be undone', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setCriticalAlert(alert)
    useDashboardStore.getState().undo()
    expect(useDashboardStore.getState().config).not.toHaveProperty('criticalAlert')
  })
})

describe('setPageButton', () => {
  it('binds each direction to its own signal', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setPageButton('next', 'flag_cruise')
    useDashboardStore.getState().setPageButton('previous', 'flag_pit_limit')
    expect(useDashboardStore.getState().config?.pageButtons).toEqual({
      next: 'flag_cruise',
      previous: 'flag_pit_limit',
    })
  })

  it('clears one direction and keeps the other', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setPageButton('next', 'flag_cruise')
    useDashboardStore.getState().setPageButton('previous', 'flag_pit_limit')
    useDashboardStore.getState().setPageButton('next', null)
    expect(useDashboardStore.getState().config?.pageButtons).toEqual({ previous: 'flag_pit_limit' })
  })

  it('removes the key entirely once both directions are cleared', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setPageButton('next', 'flag_cruise')
    useDashboardStore.getState().setPageButton('next', null)
    expect(useDashboardStore.getState().config).not.toHaveProperty('pageButtons')
  })
})

describe('setPageButton history', () => {
  it('records no history when nothing changes, and can be undone otherwise', () => {
    useDashboardStore.getState().setConfig(makeConfig('p1'))
    useDashboardStore.getState().setPageButton('next', null)
    expect(useDashboardStore.getState().past).toHaveLength(0)
    useDashboardStore.getState().setPageButton('next', 'flag_cruise')
    useDashboardStore.getState().undo()
    expect(useDashboardStore.getState().config).not.toHaveProperty('pageButtons')
  })
})
