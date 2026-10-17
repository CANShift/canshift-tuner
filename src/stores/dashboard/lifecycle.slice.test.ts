import { describe, it, expect, beforeEach } from 'vitest'
import { FIRMWARE_CAPS, type DashboardConfig } from '@canshift/core'
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

const alertAt = (firesAt: number) =>
  ({ signal: 'oil_press_bar', firesAt, direction: 'below', acknowledgeOn: 'dash' }) as const
const store = () => useDashboardStore.getState()

describe('critical alerts list', () => {
  beforeEach(() => {
    store().setConfig(makeConfig('p1'))
  })

  it('appends alerts in order', () => {
    store().addCriticalAlert(alertAt(1))
    store().addCriticalAlert(alertAt(2))
    expect(store().config?.criticalAlerts).toEqual([alertAt(1), alertAt(2)])
  })

  it('stops adding at the firmware cap', () => {
    for (let i = 0; i <= FIRMWARE_CAPS.MAX_CRITICAL_ALERTS; i++)
      store().addCriticalAlert(alertAt(i))
    expect(store().config?.criticalAlerts).toHaveLength(FIRMWARE_CAPS.MAX_CRITICAL_ALERTS)
  })

  it('edits one entry and leaves the others', () => {
    store().addCriticalAlert(alertAt(1))
    store().addCriticalAlert(alertAt(2))
    store().updateCriticalAlert(1, alertAt(3))
    expect(store().config?.criticalAlerts).toEqual([alertAt(1), alertAt(3)])
  })
})

describe('critical alerts list removal and history', () => {
  beforeEach(() => {
    store().setConfig(makeConfig('p1'))
  })

  it('removes an entry and drops the key with the last one', () => {
    store().addCriticalAlert(alertAt(1))
    store().addCriticalAlert(alertAt(2))
    store().removeCriticalAlert(0)
    expect(store().config?.criticalAlerts).toEqual([alertAt(2)])
    store().removeCriticalAlert(0)
    expect(store().config).not.toHaveProperty('criticalAlerts')
  })

  it('ignores an index past the list and records no history for it', () => {
    store().updateCriticalAlert(0, alertAt(1))
    store().removeCriticalAlert(2)
    expect(store().past).toHaveLength(0)
  })

  it('can be undone', () => {
    store().addCriticalAlert(alertAt(1))
    store().undo()
    expect(store().config).not.toHaveProperty('criticalAlerts')
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
