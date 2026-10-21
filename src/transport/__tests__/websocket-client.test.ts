import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connected, harness } from './fake-websocket'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WebSocketClient connecting', () => {
  it('connects to the dash socket', async () => {
    const { client } = await connected()
    expect(client.getStatus()).toBe('connected')
    expect(client.kind).toBe('wifi')
  })
})

describe('WebSocketClient commands', () => {
  it('sends one JSON line per frame and resolves on the status frame', async () => {
    const { client, latest } = await connected()
    const result = client.send(0x11)
    expect(latest().sent).toEqual(['{"cmd":17,"seq":1}'])
    latest().receive('{"status":"ok","uptime_ms":42}\n')
    await expect(result).resolves.toEqual({
      ok: true,
      data: { status: 'ok', uptime_ms: 42 },
    })
  })

  it('keeps one command in flight and sends the next once the first is acked', async () => {
    const { client, latest } = await connected()
    const first = client.send(0x11)
    const second = client.send(0x10)
    expect(latest().sent).toHaveLength(1)
    latest().receive('{"status":"ok"}')
    await first
    expect(latest().sent).toHaveLength(2)
    latest().receive('{"status":"error","message":"device_error"}')
    await expect(second).resolves.toMatchObject({ ok: false, error: 'device_error' })
  })

  it('routes non-status frames to subscribers', async () => {
    const { client, latest } = await connected()
    const handler = vi.fn()
    client.subscribe('can_stat', handler)
    latest().receive('{"can_stat":{"hz":842}}')
    expect(handler).toHaveBeenCalledWith({ can_stat: { hz: 842 } })
  })
})

describe('WebSocketClient losing the link', () => {
  it('fails the pending command and reconnects when the dash drops the socket', async () => {
    const { client, sockets, latest } = await connected()
    const pending = client.send(0x11)
    latest().drop()
    await expect(pending).resolves.toEqual({ ok: false, error: 'connection_closed' })
    expect(client.getStatus()).toBe('reconnecting')
    await vi.advanceTimersByTimeAsync(600)
    expect(sockets).toHaveLength(2)
    latest().accept()
    expect(client.getStatus()).toBe('connected')
  })
})

describe('WebSocketClient lifecycle', () => {
  it('opens one socket however many times it is asked to connect', async () => {
    const { client, sockets, latest } = harness()
    const first = client.connect()
    const second = client.connect()
    latest().accept()
    await Promise.all([first, second])
    await client.connect()
    expect(sockets).toHaveLength(1)
  })

  it('stays down after a deliberate disconnect', async () => {
    const { client, sockets } = await connected()
    client.disconnect()
    await vi.advanceTimersByTimeAsync(5_000)
    expect(client.getStatus()).toBe('disconnected')
    expect(sockets).toHaveLength(1)
  })

  it('reports a dash it could not reach', async () => {
    const { client, latest } = harness()
    const pending = client.connect()
    latest().drop()
    await expect(pending).rejects.toThrow('connect_failed')
    expect(client.getStatus()).toBe('disconnected')
  })

  it('refuses to send while the socket is not open', async () => {
    const { client } = harness()
    await expect(client.send(0x11)).resolves.toEqual({ ok: false, error: 'not_connected' })
  })
})

describe('WebSocketClient subscriptions', () => {
  it('hands a frame to every subscriber of its kind', async () => {
    const { client, latest } = await connected()
    const live = vi.fn()
    const busWatch = vi.fn()
    client.subscribe('tele', live)
    client.subscribe('tele', busWatch)
    latest().receive('{"tele":1,"v":{"rpm":3000}}')
    expect(live).toHaveBeenCalledTimes(1)
    expect(busWatch).toHaveBeenCalledTimes(1)
  })
})

describe('WebSocketClient attempts that open late', () => {
  it('closes an attempt that opens after a deliberate disconnect', async () => {
    const { client, latest } = harness()
    const pending = client.connect()
    client.disconnect()
    latest().accept()
    await pending
    expect(latest().readyState).toBe(3)
    expect(client.getStatus()).toBe('disconnected')
  })

  it('keeps the adopted socket when a reconnect attempt opens after it', async () => {
    const { client, sockets, latest } = await connected()
    latest().drop()
    await vi.advanceTimersByTimeAsync(600)
    const retry = latest()
    const manual = client.connect()
    expect(sockets).toHaveLength(3)
    latest().accept()
    await manual
    retry.accept()
    expect(retry.readyState).toBe(3)
    expect(latest().readyState).toBe(1)
    expect(client.getStatus()).toBe('connected')
    await vi.advanceTimersByTimeAsync(5_000)
    expect(sockets).toHaveLength(3)
  })
})

describe('WebSocketClient reconnecting by hand', () => {
  it('starts a fresh attempt when asked to connect again after a disconnect', async () => {
    const { client, sockets, latest } = harness()
    void client.connect()
    client.disconnect()
    const again = client.connect()
    latest().accept()
    await again
    expect(sockets).toHaveLength(2)
    expect(client.getStatus()).toBe('connected')
  })
})
