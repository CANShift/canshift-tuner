import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connected } from './fake-websocket'
import { KEEP_ALIVE_MS } from '../keep-alive'

const RECONNECT_WAIT_MS = 1_000

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

const evictAndReconnect = async (h: Awaited<ReturnType<typeof connected>>) => {
  h.latest().drop()
  await vi.advanceTimersByTimeAsync(RECONNECT_WAIT_MS)
  h.latest().accept()
  await vi.advanceTimersByTimeAsync(0)
}

describe('WebSocketClient sharing the dash with another device', () => {
  it('stops taking the dash back when another device keeps replacing it', async () => {
    const h = await connected()
    await evictAndReconnect(h)
    await evictAndReconnect(h)
    const opened = h.sockets.length
    h.latest().drop()
    await vi.advanceTimersByTimeAsync(RECONNECT_WAIT_MS * 30)
    expect(h.sockets.length).toBe(opened)
    expect(h.client.getStatus()).toBe('disconnected')
  })

  it('reports why it gave up', async () => {
    const h = await connected()
    const errors: (string | undefined)[] = []
    h.client.onStatus((_status, error) => errors.push(error))
    await evictAndReconnect(h)
    await evictAndReconnect(h)
    h.latest().drop()
    expect(errors.at(-1)).toBe('replaced')
  })
})

describe('WebSocketClient recovering', () => {
  it('keeps reconnecting after a single Wi-Fi drop', async () => {
    const h = await connected()
    h.latest().drop()
    await vi.advanceTimersByTimeAsync(RECONNECT_WAIT_MS)
    expect(h.client.getStatus()).not.toBe('disconnected')
  })

  it('tries again when the user asks, even after giving up', async () => {
    const h = await connected()
    await evictAndReconnect(h)
    await evictAndReconnect(h)
    h.latest().drop()
    const retry = h.client.connect()
    h.latest().accept()
    await retry
    expect(h.client.getStatus()).toBe('connected')
  })
})

describe('WebSocketClient refused by a dash that is busy', () => {
  it('stops at once on close code 4001 and says another device holds the dash', async () => {
    const h = await connected()
    const errors: (string | undefined)[] = []
    h.client.onStatus((_status, error) => errors.push(error))
    const opened = h.sockets.length
    h.latest().refuseBusy()
    await vi.advanceTimersByTimeAsync(RECONNECT_WAIT_MS * 30)
    expect(h.sockets.length).toBe(opened)
    expect(h.client.getStatus()).toBe('disconnected')
    expect(errors.at(-1)).toBe('replaced')
  })
})

describe('WebSocketClient keeping the dash', () => {
  it('sends an empty frame every few seconds, even while a command waits for its reply', async () => {
    const h = await connected()
    void h.client.send(0x0e, {}, { timeoutMs: 30_000 })
    await vi.advanceTimersByTimeAsync(KEEP_ALIVE_MS * 3)
    expect(h.latest().sent.filter((frame) => frame === '')).toHaveLength(3)
  })

  it('stops once the dash is gone', async () => {
    const h = await connected()
    const socket = h.latest()
    socket.refuseBusy()
    await vi.advanceTimersByTimeAsync(KEEP_ALIVE_MS * 3)
    expect(socket.sent.filter((frame) => frame === '')).toHaveLength(0)
  })
})
