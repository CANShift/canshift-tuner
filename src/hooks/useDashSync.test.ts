import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardConfig } from '@canshift/core'

const getConfigMock = vi.fn()

vi.mock('../transport', () => ({
  deviceIpc: { getConfig: () => getConfigMock() },
  deviceConfigIpc: {},
}))

import { readDash, readDashboard } from './useDashSync'
import { useSyncStore } from '../stores/sync/sync.store'

const ignoreLog = () => undefined

beforeEach(() => {
  getConfigMock.mockReset()
  useSyncStore.getState().setDevice({ dashboard: { pages: [] } as unknown as DashboardConfig })
})

describe('reading the dash setup', () => {
  it('drops the stored baseline when the dash setup cannot be read', async () => {
    getConfigMock.mockResolvedValue({ kind: 'error', error: 'read_error' })
    await readDashboard(ignoreLog)
    expect(useSyncStore.getState().device.dashboard).toBeNull()
  })

  it('drops the stored baseline when reading the dash throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    getConfigMock.mockRejectedValue(new Error('link_lost'))
    await readDash(ignoreLog)
    expect(useSyncStore.getState().device.dashboard).toBeNull()
  })
})
