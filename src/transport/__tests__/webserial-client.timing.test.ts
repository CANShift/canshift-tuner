import { describe, it, expect, vi } from 'vitest'
import { SerialClient } from '../webserial-client'
import {
  makeFakePort,
  makeReopenablePort,
  flush,
  registerSerialTestEnvironment,
  settledWithin,
} from './fake-serial-port'

registerSerialTestEnvironment()

describe('SerialClient — reconnect retry: keeps retrying with exponential backoff', () => {
  it('keeps retrying with exponential backoff when reopen rejects', async () => {
    vi.useFakeTimers()
    const fake = makeFakePort()
    const client = new SerialClient()
    await client.connect(fake.port)
    const openMock = vi.mocked(fake.port.open)
    openMock.mockRejectedValue(new Error('failed to open'))

    fake.closeReader()
    await flush()
    await flush()
    expect(client.getStatus()).toBe('reconnecting')
    expect(openMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(500)
    expect(openMock).toHaveBeenCalledTimes(2)
    expect(client.getStatus()).toBe('reconnecting')

    await vi.advanceTimersByTimeAsync(1000)
    expect(openMock).toHaveBeenCalledTimes(3)

    await vi.advanceTimersByTimeAsync(2000)
    expect(openMock).toHaveBeenCalledTimes(4)

    client.disconnect()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(openMock).toHaveBeenCalledTimes(4)
  })
})

describe('SerialClient — reconnect retry: recovers on a later attempt', () => {
  it('recovers on a later attempt and resets backoff after a stable connection', async () => {
    vi.useFakeTimers()
    const fake = makeReopenablePort()
    const client = new SerialClient()
    await client.connect(fake.port)
    const openMock = vi.mocked(fake.port.open)

    openMock.mockRejectedValueOnce(new Error('failed to open'))
    fake.dropConnection()
    await flush()
    await flush()
    expect(client.getStatus()).toBe('reconnecting')

    await vi.advanceTimersByTimeAsync(500)
    expect(client.getStatus()).toBe('reconnecting')

    await vi.advanceTimersByTimeAsync(1000)
    await flush()
    expect(client.getStatus()).toBe('connected')
    expect(openMock).toHaveBeenCalledTimes(3)

    await vi.advanceTimersByTimeAsync(10_000)
    fake.dropConnection()
    await flush()
    await flush()
    expect(client.getStatus()).toBe('reconnecting')

    await vi.advanceTimersByTimeAsync(500)
    expect(openMock).toHaveBeenCalledTimes(4)

    client.disconnect()
  })
})

describe('SerialClient — reconnect gives up', () => {
  it('stops after 6 attempts and settles on disconnected instead of retrying forever', async () => {
    vi.useFakeTimers()
    const fake = makeFakePort()
    const client = new SerialClient()
    await client.connect(fake.port)
    const openMock = vi.mocked(fake.port.open)
    openMock.mockRejectedValue(new Error('failed to open'))

    fake.closeReader()
    await flush()
    expect(client.getStatus()).toBe('reconnecting')

    await vi.advanceTimersByTimeAsync(10 * 60_000)

    expect(client.getStatus()).toBe('disconnected')
    const attempts = openMock.mock.calls.length - 1
    expect(attempts).toBe(6)

    await vi.advanceTimersByTimeAsync(10 * 60_000)
    expect(openMock.mock.calls.length - 1).toBe(6)

    client.disconnect()
  })
})

describe('SerialClient — stale ack discard after timeout: discards a late ack for', () => {
  it('discards a late ack for a timed-out command instead of resolving the next send', async () => {
    vi.useFakeTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    await client.connect(fake.port)
    fake.pushBytes('{"tele":1,"v":{}}\n')
    await flush()

    const first = client.send(0x01)
    const second = client.send(0x02)
    await flush()
    expect(fake.written.join('')).toBe('{"cmd":1}\n')

    await vi.advanceTimersByTimeAsync(5_000)
    expect(await first).toEqual({ ok: false, error: 'ack_timeout' })
    expect(fake.written.join('')).toBe('{"cmd":1}\n')

    fake.pushBytes('{"status":"ok","uptime_ms":1}\n')
    await flush()
    expect(fake.written.join('')).toBe('{"cmd":1}\n{"cmd":2}\n')

    expect(await settledWithin(second)).toBe(false)

    fake.pushBytes('{"status":"ok"}\n')
    const ack = await second
    expect(ack.ok).toBe(true)
    warn.mockRestore()
    client.disconnect()
  })
})

describe('SerialClient — stale ack discard after timeout: dispatches the next send after', () => {
  it('dispatches the next send after the flush window when no late ack arrives', async () => {
    vi.useFakeTimers()
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    await client.connect(fake.port)
    fake.pushBytes('{"tele":1,"v":{}}\n')
    await flush()

    const first = client.send(0x01)
    await flush()
    await vi.advanceTimersByTimeAsync(5_000)
    expect((await first).error).toBe('ack_timeout')

    const second = client.send(0x02)
    await flush()
    expect(fake.written.join('')).toBe('{"cmd":1}\n')

    await vi.advanceTimersByTimeAsync(1_000)
    await flush()
    expect(fake.written.join('')).toBe('{"cmd":1}\n{"cmd":2}\n')

    fake.pushBytes('{"status":"ok"}\n')
    const ack = await second
    expect(ack.ok).toBe(true)
    client.disconnect()
  })
})

describe('SerialClient — a device that has not spoken yet: waits past the normal ack', () => {
  it('waits past the normal ack timeout while the board is still booting', async () => {
    vi.useFakeTimers()
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    await client.connect(fake.port)

    const pending = client.send(0x01)
    await flush()

    await vi.advanceTimersByTimeAsync(5_000)
    let settled = false
    void pending.then(() => {
      settled = true
    })
    await flush()
    expect(settled).toBe(false)

    fake.pushBytes('{"status":"ok"}\n')
    expect((await pending).ok).toBe(true)
    client.disconnect()
  })
})

describe('SerialClient — a device that has not spoken yet: gives up once the extended', () => {
  it('gives up once the extended window elapses', async () => {
    vi.useFakeTimers()
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    await client.connect(fake.port)

    const pending = client.send(0x01)
    await flush()
    await vi.advanceTimersByTimeAsync(20_000)

    expect(await pending).toEqual({ ok: false, error: 'ack_timeout' })
    client.disconnect()
  })
})

describe('SerialClient — a device that has not spoken yet: returns to the normal timeout', () => {
  it('returns to the normal timeout once the device has been heard', async () => {
    vi.useFakeTimers()
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    await client.connect(fake.port)
    fake.pushBytes('{"tele":1,"v":{}}\n')
    await flush()

    const pending = client.send(0x01)
    await flush()
    await vi.advanceTimersByTimeAsync(5_000)

    expect(await pending).toEqual({ ok: false, error: 'ack_timeout' })
    client.disconnect()
  })
})
