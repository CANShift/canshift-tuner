import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebSocketClient } from '../websocket-client'

const URL = 'ws://192.168.4.1/ws'

class FakeSocket {
  readyState = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3
    this.onclose?.()
  }

  accept(): void {
    this.readyState = 1
    this.onopen?.()
  }

  receive(data: string): void {
    this.onmessage?.({ data } as MessageEvent)
  }

  drop(): void {
    this.readyState = 3
    this.onclose?.()
  }
}

const harness = () => {
  const sockets: FakeSocket[] = []
  const client = new WebSocketClient(URL, () => {
    const socket = new FakeSocket()
    sockets.push(socket)
    return socket as unknown as WebSocket
  })
  const latest = (): FakeSocket => {
    const socket = sockets[sockets.length - 1]
    if (socket === undefined) throw new Error('no socket opened')
    return socket
  }
  return { client, sockets, latest }
}

const connected = async () => {
  const h = harness()
  const pending = h.client.connect()
  h.latest().accept()
  await pending
  return h
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WebSocketClient', () => {
  it('connects to the dash socket', async () => {
    const { client } = await connected()
    expect(client.getStatus()).toBe('connected')
    expect(client.kind).toBe('wifi')
  })

  it('sends one JSON line per frame and resolves on the status frame', async () => {
    const { client, latest } = await connected()
    const result = client.send(0x11)
    expect(latest().sent).toEqual(['{"cmd":17}'])
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
