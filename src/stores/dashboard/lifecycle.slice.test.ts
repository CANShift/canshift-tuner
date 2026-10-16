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
