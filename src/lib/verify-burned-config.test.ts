import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { produce } from 'immer'

import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'
import { getDeviceLink } from '../transport/link'
import { CMD_GET_CONFIG, CMD_PING } from '../transport/opcodes'
import { verifyBurnedConfig } from './verify-burned-config'

vi.mock('../transport/link', () => ({
  getDeviceLink: vi.fn(),
}))

type Reply = { ok: boolean; data?: Record<string, unknown>; error?: string }

const sendMock = vi.fn()

const pong = (configReload?: string): Reply => ({
  ok: true,
  data:
    configReload === undefined ? { uptime_ms: 1 } : { uptime_ms: 1, config_reload: configReload },
})

const answer = (pings: Reply[], stored: unknown = DEFAULT_SIM_CONFIG): void => {
  const queue = [...pings]
  sendMock.mockImplementation((cmd: number) => {
    if (cmd === CMD_GET_CONFIG) return Promise.resolve({ ok: true, data: { config: stored } })
    if (cmd !== CMD_PING) return Promise.resolve({ ok: false, error: 'unknown_command' })
    return Promise.resolve(queue.length > 1 ? queue.shift() : queue[0])
  })
}

const verify = async (): Promise<Awaited<ReturnType<typeof verifyBurnedConfig>>> => {
  const result = verifyBurnedConfig(DEFAULT_SIM_CONFIG)
  await vi.runAllTimersAsync()
  return result
}

beforeEach(() => {
  vi.useFakeTimers()
  sendMock.mockReset()
  vi.mocked(getDeviceLink).mockReturnValue({ send: sendMock } as unknown as ReturnType<
    typeof getDeviceLink
  >)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('verifyBurnedConfig with a reload report', () => {
  it('waits for the dash to load the config, then checks the stored file', async () => {
    answer([pong('pending'), pong('pending'), pong('applied')])
    expect(await verify()).toEqual({ kind: 'ok' })
    expect(sendMock).toHaveBeenCalledWith(CMD_GET_CONFIG, {}, expect.anything())
  })

  it('reports a refusal without reading the file back', async () => {
    answer([pong('pending'), pong('refused')])
    expect(await verify()).toEqual({ kind: 'refused' })
    expect(sendMock).not.toHaveBeenCalledWith(CMD_GET_CONFIG, {}, expect.anything())
  })
})

describe('verifyBurnedConfig without a settled report', () => {
  it('compares the stored file on firmware that does not report the reload', async () => {
    const other = produce(DEFAULT_SIM_CONFIG, (config) => {
      config.pages.pop()
    })
    answer([pong()], other)
    expect(await verify()).toEqual({ kind: 'mismatch' })
  })

  it('falls back to the stored file when the reload never settles', async () => {
    answer([pong('pending')])
    expect(await verify()).toEqual({ kind: 'ok' })
  })

  it('reads an unknown reload value as no report', async () => {
    answer([pong('exploded')])
    expect(await verify()).toEqual({ kind: 'ok' })
  })

  it('gives up when the dash never answers', async () => {
    answer([{ ok: false, error: 'ack_timeout' }])
    expect(await verify()).toEqual({ kind: 'unreachable' })
  })
})
