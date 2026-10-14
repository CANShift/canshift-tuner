import { describe, it, expect, vi } from 'vitest'
import { SerialClient, getSerialClient } from '../webserial-client'
import { makeFakePort, flush, registerSerialTestEnvironment } from './fake-serial-port'

registerSerialTestEnvironment()

describe('SerialClient — single-instance behaviour: closes the previous port when', () => {
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
})

describe('SerialClient — single-instance behaviour: leaves the new connection able', () => {
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

describe('SerialClient — reset lines on open: holds DTR asserted on a', () => {
  it('holds DTR asserted on a native-USB board so opening the port does not reset it', async () => {
    const { base, signals } = makeSignalPort(0x303a)
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(base.port)

    expect(signals).toEqual([{ dataTerminalReady: true, requestToSend: false }])
    client.disconnect()
  })
})

describe('SerialClient — reset lines on open: keeps DTR deasserted on a', () => {
  it('keeps DTR deasserted on a CH340 board, where asserting it triggers the auto-reset', async () => {
    const { base, signals } = makeSignalPort(0x1a86)
    const client = new SerialClient({ disableReconnect: true })

    await client.connect(base.port)

    expect(signals).toEqual([{ dataTerminalReady: false, requestToSend: false }])
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
