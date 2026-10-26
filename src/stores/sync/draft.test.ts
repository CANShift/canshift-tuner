import { beforeEach, describe, expect, it } from 'vitest'
import { parseCanshiftFile } from '@canshift/core'
import type { DashboardConfig } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { serializeBackup } from '../../lib/backup/backup'
import { useDashboardStore } from '../dashboard.store'
import { withDefaultTheme } from '../dashboard/lifecycle.slice'
import { useSignalStore } from '../signal.store'
import { adoptDeviceDashboard, pullFromDash } from './draft'
import { useSyncStore } from './sync.store'

const named = (name: string): DashboardConfig => withDefaultTheme({ ...DEFAULT_SIM_CONFIG, name })

const savedProject = (dashboard: DashboardConfig) => {
  const { selectedProfileKey, signals } = useSignalStore.getState()
  const file = serializeBackup(
    { dashboard, ecuProfileKey: selectedProfileKey, signals },
    new Date()
  )
  return parseCanshiftFile(file)
}

beforeEach(() => {
  useDashboardStore.getState().setConfig(named('Edited here'))
  useSyncStore.getState().setDevice({ dashboard: named('Synced') })
  useSyncStore.getState().setComparison(null)
})

describe('connecting to a dash that holds another setup', () => {
  it('keeps the browser edits and reports a different project', () => {
    adoptDeviceDashboard(named('From the car'))
    expect(useSyncStore.getState().comparison).toBe('differentProject')
    expect(useDashboardStore.getState().config?.name).toBe('Edited here')
  })

  it('reports an empty dash without touching the browser setup', () => {
    adoptDeviceDashboard(null)
    expect(useSyncStore.getState().comparison).toBe('deviceEmpty')
    expect(useDashboardStore.getState().config?.name).toBe('Edited here')
  })
})

describe('pulling from the dash', () => {
  it('rebuilds a full project from the dash setup', () => {
    const fromCar = named('From the car')
    adoptDeviceDashboard(fromCar)
    pullFromDash()
    const pulled = useDashboardStore.getState().config
    expect(pulled).toEqual(fromCar)
    expect(useSyncStore.getState().comparison).toBeNull()
    expect(pulled && savedProject(pulled).kind).toBe('ok')
  })

  it('can be undone back to the browser edits', () => {
    adoptDeviceDashboard(named('From the car'))
    pullFromDash()
    useDashboardStore.getState().undo()
    expect(useDashboardStore.getState().config?.name).toBe('Edited here')
  })
})
