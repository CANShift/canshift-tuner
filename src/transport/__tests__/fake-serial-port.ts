import { afterEach, beforeEach, vi } from 'vitest'
import { __resetSerialClientSingleton } from '../webserial-client'

export interface FakePort {
  port: SerialPort
  pushBytes: (bytes: Uint8Array | string) => void
  closeReader: () => void
  written: string[]
  opened: boolean
  closed: boolean
  closeCalls: number
}

interface RxHandle {
  controller: ReadableStreamDefaultController<Uint8Array> | null
}

interface PortState {
  opened: boolean
  closed: boolean
  closeCalls: number
}

const FLUSH_TICKS = 20

const closeOnce = (rx: RxHandle) => {
  const controller = rx.controller
  rx.controller = null
  controller?.close()
}

const readableFor = (rx: RxHandle) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      rx.controller = controller
    },
  })

const recordingWritable = (written: string[]) => {
  const decoder = new TextDecoder()
  return new WritableStream<Uint8Array>({
    write(chunk) {
      written.push(decoder.decode(chunk))
    },
  })
}

const fakeSerialPort = (rx: RxHandle, written: string[], state: PortState): SerialPort =>
  ({
    open: vi.fn(async () => {
      state.opened = true
    }),
    close: vi.fn(async () => {
      state.closeCalls++
      state.closed = true
      closeOnce(rx)
    }),
    readable: readableFor(rx),
    writable: recordingWritable(written),
  }) as unknown as SerialPort

const encode = (bytes: Uint8Array | string): Uint8Array =>
  typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes

export const makeFakePort = (): FakePort => {
  const rx: RxHandle = { controller: null }
  const written: string[] = []
  const state: PortState = { opened: false, closed: false, closeCalls: 0 }
  return {
    port: fakeSerialPort(rx, written, state),
    pushBytes: (bytes) => rx.controller?.enqueue(encode(bytes)),
    closeReader: () => {
      closeOnce(rx)
    },
    written,
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

export const makeReopenablePort = (): { port: SerialPort; dropConnection: () => void } => {
  const rx: RxHandle = { controller: null }
  const streams = { readable: readableFor(rx), writable: new WritableStream<Uint8Array>() }
  const port = {
    open: vi.fn(async () => {
      streams.readable = readableFor(rx)
      streams.writable = new WritableStream<Uint8Array>()
    }),
    close: vi.fn(async () => {
      closeOnce(rx)
    }),
    get readable() {
      return streams.readable
    },
    get writable() {
      return streams.writable
    },
  } as unknown as SerialPort
  return { port, dropConnection: () => closeOnce(rx) }
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

export const flush = async (): Promise<void> => {
  for (let i = 0; i < FLUSH_TICKS; i++) {
    await Promise.resolve()
  }
}

export const settledWithin = async (promise: Promise<unknown>): Promise<boolean> => {
  let resolved = false
  void promise.then(() => {
    resolved = true
  })
  await flush()
  return resolved
}

export const registerSerialTestEnvironment = (): void => {
  beforeEach(() => {
    installNavigatorSerial()
    __resetSerialClientSingleton()
  })
  afterEach(() => {
    __resetSerialClientSingleton()
    vi.useRealTimers()
  })
}
