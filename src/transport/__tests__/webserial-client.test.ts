import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SerialClient, __resetSerialClientSingleton, getSerialClient } from '../webserial-client'

interface FakePort {
  port: SerialPort
  pushBytes: (bytes: Uint8Array | string) => void
  closeReader: () => void
  written: string[]
  opened: boolean
  closed: boolean
  closeCalls: number
}

const closeOnce = (state: { controller: ReadableStreamDefaultController<Uint8Array> | null }) => {
  const controller = state.controller
  state.controller = null
  controller?.close()
}

const makeFakePort = (): FakePort => {
  const rx = { controller: null as ReadableStreamDefaultController<Uint8Array> | null }
  const written: string[] = []
  const decoder = new TextDecoder()
  const state = {
    opened: false,
    closed: false,
    closeCalls: 0,
  }

  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      rx.controller = controller
    },
  })

  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      written.push(decoder.decode(chunk))
    },
  })

  const port = {
    open: vi.fn(async () => {
      state.opened = true
    }),
    close: vi.fn(async () => {
      state.closeCalls++
      state.closed = true
      closeOnce(rx)
    }),
    readable,
    writable,
  } as unknown as SerialPort

  return {
    port,
    pushBytes: (bytes) => {
      const encoded = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes
      rx.controller?.enqueue(encoded)
    },
    closeReader: () => {
      closeOnce(rx)
    },
    get written() {
      return written
    },
    get opened() {
      return state.opened
    },
    get closed() {
      return state.closed
    },
    get closeCalls() {
      return state.closeCalls
    },
  }
}

const installNavigatorSerial = (getPortsResult: SerialPort[] = []): void => {
  const fakeSerial = {
    requestPort: vi.fn(async () => {
      throw new Error('test should pass a port directly')
    }),
    getPorts: vi.fn(async () => getPortsResult),
  }
  Object.defineProperty(globalThis, 'navigator', {
    value: { serial: fakeSerial },
    configurable: true,
  })
}

const flush = async (): Promise<void> => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve()
  }
}

beforeEach(() => {
  installNavigatorSerial()
  __resetSerialClientSingleton()
})

afterEach(() => {
  __resetSerialClientSingleton()
  vi.useRealTimers()
})

describe('SerialClient — frame parser', () => {
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

describe('SerialClient — ack matching', () => {
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

describe('SerialClient — subscription dispatch', () => {
  it('routes `log` / `tele` / `can` / `can_stat` frames to handlers without resolving an ack', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const log = vi.fn()
    const tele = vi.fn()
    const can = vi.fn()
    const canStat = vi.fn()
    client.subscribe('log', log)
    client.subscribe('tele', tele)
    client.subscribe('can', can)
    client.subscribe('can_stat', canStat)

    await client.connect(fake.port)

    const ackPromise = client.send(0x10)
    await flush()
    fake.pushBytes('{"log":1,"lvl":"info","tag":"x","msg":"y"}\n')
    fake.pushBytes('{"tele":1,"v":{"rpm":1}}\n')
    fake.pushBytes('{"can":1,"id":1,"len":0,"d":[]}\n')
    fake.pushBytes('{"can_stat":1,"fps":10,"errors":0}\n')
    await flush()

    expect(log).toHaveBeenCalledTimes(1)
    expect(tele).toHaveBeenCalledTimes(1)
    expect(can).toHaveBeenCalledTimes(1)
    expect(canStat).toHaveBeenCalledTimes(1)

    let resolved = false
    void ackPromise.then(() => {
      resolved = true
    })
    await flush()
    expect(resolved).toBe(false)

    fake.pushBytes('{"status":"ok"}\n')
    await ackPromise
    client.disconnect()
  })
})

describe('SerialClient — single-instance behaviour', () => {
  it('closes the previous port when a second connect() is called', async () => {
    const first = makeFakePort()
    const second = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(first.port)
    expect(first.opened).toBe(true)
    expect(client.getPort()).toBe(first.port)

    await client.connect(second.port)
    await flush()

    expect(first.closeCalls).toBeGreaterThanOrEqual(1)
    expect(second.opened).toBe(true)
    expect(client.getPort()).toBe(second.port)

    client.disconnect()
  })

  it('leaves the new connection able to send after a connect over an open one', async () => {
    const first = makeFakePort()
    const second = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(first.port)
    await client.connect(second.port)
    await flush()

    const pending = client.send(1, { foo: 'bar' })
    await flush()
    second.pushBytes('{"status":"ok"}\n')

    await expect(pending).resolves.toEqual(expect.objectContaining({ ok: true }))
    expect(second.written.join('')).toContain('"cmd":1')
    expect(first.written).toEqual([])

    client.disconnect()
  })
})

describe('SerialClient — status listener isolation', () => {
  it('keeps notifying the remaining listeners when one throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })
    const seen: string[] = []

    client.onStatus(() => {
      throw new Error('listener blew up')
    })
    client.onStatus((status) => {
      seen.push(status)
    })

    await client.connect(fake.port)
    await flush()

    expect(seen).toContain('connected')
    expect(
      warn.mock.calls.filter(([msg]) => typeof msg === 'string' && msg.includes('status listener'))
    ).not.toHaveLength(0)

    client.disconnect()
    warn.mockRestore()
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

describe('SerialClient — send queue', () => {
  it('resolves the 9th concurrent send with queue_full', async () => {
    const fake = makeFakePort()
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(fake.port)

    const inFlight = client.send(0x01)
    const queued: Promise<unknown>[] = []
    for (let i = 0; i < 8; i++) {
      queued.push(client.send(0x01))
    }
    const overflow = await client.send(0x01)

    expect(overflow.ok).toBe(false)
    expect(overflow.error).toBe('queue_full')

    fake.pushBytes('{"status":"ok"}\n')
    await flush()
    await inFlight
    for (let i = 0; i < 8; i++) {
      await flush()
      fake.pushBytes('{"status":"ok"}\n')
      await flush()
    }
    await Promise.all(queued)
    client.disconnect()
  })
})

const makeReopenablePort = (): { port: SerialPort; dropConnection: () => void } => {
  const rx = { controller: null as ReadableStreamDefaultController<Uint8Array> | null }
  let readable = new ReadableStream<Uint8Array>({
    start(c) {
      rx.controller = c
    },
  })
  let writable = new WritableStream<Uint8Array>()
  const arm = (): void => {
    readable = new ReadableStream<Uint8Array>({
      start(c) {
        rx.controller = c
      },
    })
    writable = new WritableStream<Uint8Array>()
  }
  const port = {
    open: vi.fn(async () => {
      arm()
    }),
    close: vi.fn(async () => {
      closeOnce(rx)
    }),
    get readable() {
      return readable
    },
    get writable() {
      return writable
    },
  } as unknown as SerialPort
  return {
    port,
    dropConnection: () => {
      closeOnce(rx)
    },
  }
}

describe('SerialClient — reconnect retry', () => {
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

describe('SerialClient — stale ack discard after timeout', () => {
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

    let secondResolved = false
    void second.then(() => {
      secondResolved = true
    })
    await flush()
    expect(secondResolved).toBe(false)

    fake.pushBytes('{"status":"ok"}\n')
    const ack = await second
    expect(ack.ok).toBe(true)
    warn.mockRestore()
    client.disconnect()
  })

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

describe('SerialClient — reset lines on open', () => {
  const makeSignalPort = (usbVendorId?: number) => {
    const signals: Array<Record<string, boolean>> = []
    const base = makeFakePort()
    const port = base.port as unknown as Record<string, unknown>
    port.getInfo = () => ({ usbVendorId })
    port.setSignals = async (s: Record<string, boolean>) => {
      signals.push(s)
    }
    return { base, signals }
  }

  it('holds DTR asserted on a native-USB board so opening the port does not reset it', async () => {
    const { base, signals } = makeSignalPort(0x303a)
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(base.port)

    expect(signals).toEqual([{ dataTerminalReady: true, requestToSend: false }])
    client.disconnect()
  })

  it('keeps DTR deasserted on a CH340 board, where asserting it triggers the auto-reset', async () => {
    const { base, signals } = makeSignalPort(0x1a86)
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(base.port)

    expect(signals).toEqual([{ dataTerminalReady: false, requestToSend: false }])
    client.disconnect()
  })
})

describe('SerialClient — a device that has not spoken yet', () => {
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

describe('getSerialClient singleton', () => {
  it('returns the same instance across calls', () => {
    const a = getSerialClient()
    const b = getSerialClient()
    expect(a).toBe(b)
  })
})
