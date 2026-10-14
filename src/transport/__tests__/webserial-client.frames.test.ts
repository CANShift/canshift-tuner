import { describe, it, expect, vi } from 'vitest'
import { SerialClient } from '../webserial-client'
import {
  makeFakePort,
  flush,
  registerSerialTestEnvironment,
  settledWithin,
} from './fake-serial-port'

registerSerialTestEnvironment()

describe('SerialClient — frame parser: splits incoming bytes on newlines', () => {
  it('splits incoming bytes on newlines and dispatches each JSON object', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const tele = vi.fn()
    client.subscribe('tele', tele)

    await client.connect(fake.port)
    fake.pushBytes('{"tele":1,"v":{"rpm":1000}}\n{"tele":1,"v":{"rpm":2000}}\n')
    await flush()

    expect(tele).toHaveBeenCalledTimes(2)
    expect(tele).toHaveBeenNthCalledWith(1, { tele: 1, v: { rpm: 1000 } })
    expect(tele).toHaveBeenNthCalledWith(2, { tele: 1, v: { rpm: 2000 } })

    client.disconnect()
  })
})

describe('SerialClient — frame parser: silently drops free-form text and', () => {
  it('silently drops free-form text and warns only on malformed JSON object frames', async () => {
    const fake = makeFakePort()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const client = new SerialClient({ disableReconnect: true })
    const log = vi.fn()
    client.subscribe('log', log)

    await client.connect(fake.port)
    fake.pushBytes('\n\nnot-json\n[   485][E][Preferences.cpp:50] nvs_open failed\n')
    fake.pushBytes('{"log":1,"broken\n')
    fake.pushBytes('{"log":1,"lvl":"info","tag":"x","msg":"y"}\n')
    await flush()

    expect(log).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
    client.disconnect()
  })
})

describe('SerialClient — frame parser: handles a frame split across', () => {
  it('handles a frame split across multiple chunks', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const tele = vi.fn()
    client.subscribe('tele', tele)

    await client.connect(fake.port)
    fake.pushBytes('{"tele":1,"v":{"r')
    fake.pushBytes('pm":42}}\n')
    await flush()

    expect(tele).toHaveBeenCalledWith({ tele: 1, v: { rpm: 42 } })
    client.disconnect()
  })
})

describe('SerialClient — ack matching: resolves the next non-discriminated `{status:"ok"}`', () => {
  it('resolves the next non-discriminated `{status:"ok"}` frame as the ack', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(fake.port)
    const ackPromise = client.send(0x02, { payload: { a: 1 } })
    await flush()

    expect(fake.written.join('')).toBe('{"cmd":2,"payload":{"a":1}}\n')

    fake.pushBytes('{"status":"ok","echo":true}\n')
    const ack = await ackPromise

    expect(ack.ok).toBe(true)
    expect(ack.data).toEqual({ status: 'ok', echo: true })
    client.disconnect()
  })
})

describe('SerialClient — ack matching: resolves with a parsed error', () => {
  it('resolves with a parsed error message on `{status:"error"}`', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(fake.port)
    const ackPromise = client.send(0x03)
    await flush()
    fake.pushBytes('{"status":"error","message":"config_not_found"}\n')
    const ack = await ackPromise

    expect(ack.ok).toBe(false)
    expect(ack.error).toBe('config_not_found')
    client.disconnect()
  })
})

const SUBSCRIPTION_FRAMES: readonly [string, string][] = [
  ['log', '{"log":1,"lvl":"info","tag":"x","msg":"y"}\n'],
  ['tele', '{"tele":1,"v":{"rpm":1}}\n'],
  ['can', '{"can":1,"id":1,"len":0,"d":[]}\n'],
  ['can_stat', '{"can_stat":1,"fps":10,"errors":0}\n'],
]

describe('SerialClient — subscription dispatch', () => {
  it('routes `log` / `tele` / `can` / `can_stat` frames to handlers without resolving an ack', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const handlers = SUBSCRIPTION_FRAMES.map(([name]) => {
      const handler = vi.fn()
      client.subscribe(name, handler)
      return handler
    })
    await client.connect(fake.port)

    const ackPromise = client.send(0x10)
    await flush()
    SUBSCRIPTION_FRAMES.forEach(([, line]) => {
      fake.pushBytes(line)
    })
    await flush()
    handlers.forEach((handler) => {
      expect(handler).toHaveBeenCalledTimes(1)
    })

    expect(await settledWithin(ackPromise)).toBe(false)
    fake.pushBytes('{"status":"ok"}\n')
    await ackPromise
    client.disconnect()
  })
})

describe('SerialClient — rx buffer overflow', () => {
  it('drops a newline-free flood and resyncs on the next complete frame', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const seen: unknown[] = []

    await client.connect(fake.port)
    client.subscribe('log', (event) => {
      seen.push(event)
    })

    for (let i = 0; i < 16; i++) {
      fake.pushBytes('x'.repeat(64 * 1024))
      await flush()
    }

    expect(
      warn.mock.calls.filter(([msg]) => typeof msg === 'string' && msg.includes('rx buffer passed'))
    ).toHaveLength(1)

    fake.pushBytes('tail-of-the-garbage\n{"log":"back"}\n')
    await flush()

    expect(seen).toEqual([{ log: 'back' }])

    client.disconnect()
    warn.mockRestore()
  })
})

describe('SerialClient — subscriber isolation', () => {
  it('a throwing subscriber does not tear down the connection', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const good = vi.fn()

    client.subscribe('tele', () => {
      throw new Error('render blew up')
    })
    client.subscribe('can', good)

    await client.connect(fake.port)
    fake.pushBytes('{"tele":1,"v":{"rpm":1}}\n')
    await flush()

    expect(client.getStatus()).toBe('connected')

    fake.pushBytes('{"can":1,"id":1,"len":0,"d":[]}\n')
    await flush()

    expect(good).toHaveBeenCalledTimes(1)
    expect(
      warn.mock.calls.filter(([msg]) => typeof msg === 'string' && msg.includes('tele subscriber'))
    ).toHaveLength(1)

    client.disconnect()
    warn.mockRestore()
  })
})
