import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import type { VerifyResult } from '../verify-burned-config'

const verifyMock = vi.fn<() => Promise<VerifyResult>>()

vi.mock('../../transport', () => ({
  usbService: { pushConfig: () => Promise.resolve({ kind: 'ok' }) },
  deviceConfigIpc: {},
}))
vi.mock('../verify-burned-config', () => ({ verifyBurnedConfig: () => verifyMock() }))

import { dashWriter } from './dash-writer'
import { failureForCode } from './send-codes'

const config = {} as DashboardConfig

beforeEach(() => {
  verifyMock.mockReset()
})

describe('dashWriter.writeDashboard', () => {
  it('confirms a layout the dash read back', async () => {
    verifyMock.mockResolvedValue({ kind: 'ok' })
    await expect(dashWriter.writeDashboard(config)).resolves.toEqual({ ok: true })
  })

  it.each<VerifyResult>([{ kind: 'unreachable' }, { kind: 'fetch_failed', error: 'read_error' }])(
    'reports a dropped link when the dash could not confirm the layout ($kind)',
    async (verify) => {
      verifyMock.mockResolvedValue(verify)
      const result = await dashWriter.writeDashboard(config)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(failureForCode(result.code)).toEqual({ kind: 'dropped' })
    }
  )
})
