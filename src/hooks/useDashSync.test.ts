import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardConfig } from '@canshift/core'

vi.mock('../transport', () => ({
  deviceIpc: { getConfig: () => Promise.resolve({ kind: 'error', error: 'read_error' }) },
  deviceConfigIpc: {},
}))

import { readDashboard } from './useDashSync'
import { useSyncStore } from '../stores/sync/sync.store'

beforeEach(() => {
  useSyncStore.getState().setDevice({ dashboard: { pages: [] } as unknown as DashboardConfig })
})

describe('readDashboard', () => {
  it('drops the stored baseline when the dash setup cannot be read', async () => {
    await readDashboard(() => undefined)
    expect(useSyncStore.getState().device.dashboard).toBeNull()
  })
})
