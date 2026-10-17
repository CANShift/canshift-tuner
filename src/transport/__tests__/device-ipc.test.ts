import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CURRENT_SCHEMA_VERSION } from '@canshift/core'

import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { deviceIpc } from '../device-ipc'
import { getDeviceLink } from '../link'

vi.mock('../link', () => ({
  getDeviceLink: vi.fn(),
}))

const sendMock = vi.fn()

const respondWith = (response: {
  ok: boolean
  data?: Record<string, unknown>
  error?: string
}): void => {
  sendMock.mockResolvedValue(response)
}

beforeEach(() => {
  sendMock.mockReset()
  vi.mocked(getDeviceLink).mockReturnValue({ send: sendMock } as unknown as ReturnType<
    typeof getDeviceLink
  >)
})

describe('deviceIpc.getConfig (#1703): passes a current-version valid config', () => {
  it('passes a current-version valid config through unchanged', async () => {
    respondWith({ ok: true, data: { config: structuredClone(DEFAULT_SIM_CONFIG) } })

    const result = await deviceIpc.getConfig()

    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') return
    expect(result.config.version).toBe(CURRENT_SCHEMA_VERSION)
    expect(result.migrationsApplied).toEqual([])
    expect(result.config).toEqual(DEFAULT_SIM_CONFIG)
  })

  it('migrates an old-version config to the current schema', async () => {
    const oldConfig = { ...structuredClone(DEFAULT_SIM_CONFIG), version: '1.24.0' }
    respondWith({ ok: true, data: { config: oldConfig } })

    const result = await deviceIpc.getConfig()

    expect(result.kind).toBe('ok')
    if (result.kind !== 'ok') return
    expect(result.config.version).toBe(CURRENT_SCHEMA_VERSION)
    expect(result.migrationsApplied.length).toBeGreaterThan(0)
    expect(result.migrationsApplied[0]).toContain('1.24.0')
  })
})

describe('deviceIpc.getConfig (#1703): returns an error', () => {
  it('returns an error when the config has no usable version', async () => {
    respondWith({ ok: true, data: { config: { pages: [] } } })

    const result = await deviceIpc.getConfig()

    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.error).toContain('config_migration_failed')
  })

  it('refuses a config older than the migration floor', async () => {
    const tooOld = { ...structuredClone(DEFAULT_SIM_CONFIG), version: '1.22.0' }
    respondWith({ ok: true, data: { config: tooOld } })

    const result = await deviceIpc.getConfig()

    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.error).toContain('config_migration_failed')
  })

  it('returns an error when the migration chain cannot reach the current version', async () => {
    respondWith({ ok: true, data: { config: { version: '0.0.1' } } })

    const result = await deviceIpc.getConfig()

    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.error).toContain('config_migration_failed')
  })
})

describe('deviceIpc.getConfig (#1703): returns an error', () => {
  it('returns an error when a current-version config fails schema validation', async () => {
    respondWith({
      ok: true,
      data: { config: { version: CURRENT_SCHEMA_VERSION, pages: 'corrupt' } },
    })

    const result = await deviceIpc.getConfig()

    expect(result.kind).toBe('error')
    if (result.kind !== 'error') return
    expect(result.error).toContain('invalid_dashboard_config')
  })

  it('returns none when the device has no config', async () => {
    respondWith({ ok: false, error: 'config_not_found' })

    const result = await deviceIpc.getConfig()

    expect(result).toEqual({ kind: 'none' })
  })
})

describe('deviceIpc.getConfig (#1703): returns none when the response', () => {
  it('returns none when the response carries no config object', async () => {
    respondWith({ ok: true, data: {} })

    const result = await deviceIpc.getConfig()

    expect(result).toEqual({ kind: 'none' })
  })

  it('propagates transport errors', async () => {
    respondWith({ ok: false, error: 'ack_timeout' })

    const result = await deviceIpc.getConfig()

    expect(result).toEqual({ kind: 'error', error: 'ack_timeout' })
  })
})

describe('deviceIpc.getConfig: a dash newer than this tuner', () => {
  it('reports a config from a newer schema as newer, not as an error', async () => {
    const newer = { ...structuredClone(DEFAULT_SIM_CONFIG), version: '99.0.0' }
    respondWith({ ok: true, data: { config: newer } })

    const result = await deviceIpc.getConfig()

    expect(result).toEqual({ kind: 'newer' })
  })
})
