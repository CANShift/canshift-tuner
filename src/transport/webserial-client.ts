import { humanizeTransportError } from './humanize-transport-error'
import { bestEffort } from './best-effort'
import { errorMessage } from '../lib/error-message'
import { LineFramer } from './line-framer'
import { AckQueue } from './ack-queue'
import { ReconnectScheduler } from './reconnect-scheduler'
import { SerialEventHub } from './serial-events'
import type { AckResult, SendOptions } from './ack-queue'
import type { SerialActivityDirection, SerialStatus, StatusListener } from './serial-events'

export { putConfigTimeoutMs } from './ack-queue'
export type { AckResult, SendOptions } from './ack-queue'
export type { SerialActivityDirection, SerialStatus } from './serial-events'

const DEFAULT_BAUD_RATE = 115_200

const ENCODER = new TextEncoder()

export interface SerialClientOptions {
  baudRate?: number
  disableReconnect?: boolean
}

type Handler<T> = (event: T) => void
type Unsubscribe = () => void

interface PortHandles {
  port: SerialPort
  reader: ReadableStreamDefaultReader<Uint8Array>
  writer: WritableStreamDefaultWriter<Uint8Array>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const safeJsonParse = (line: string): unknown => {
  const trimmed = line.trim()
  if (trimmed.length === 0 || !trimmed.startsWith('{')) return null
  try {
    return JSON.parse(trimmed) as unknown
  } catch (err) {
    const reason = errorMessage(err, 'unknown')
    const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed
    console.warn(`[serial] dropped malformed frame (${reason}): ${preview}`)
    return null
  }
}

export class SerialClient {
  private active: PortHandles | null = null
  private readLoop: Promise<void> | null = null
  private status: SerialStatus = 'disconnected'
  private lastError: string | undefined
  private intentionalDisconnect = false
  private suppressNextReconnect = false
  private readonly baudRate: number
  private readonly framer = new LineFramer()
  private readonly hub = new SerialEventHub()
  private readonly acks: AckQueue
  private readonly reconnect: ReconnectScheduler

  constructor(opts: SerialClientOptions = {}) {
    this.baudRate = opts.baudRate ?? DEFAULT_BAUD_RATE
    const autoReconnect = !opts.disableReconnect
    this.acks = new AckQueue({
      canSend: () => this.active !== null && this.status === 'connected',
      write: (payload) => this.writePayload(payload),
    })
    this.reconnect = new ReconnectScheduler({
      enabled: () => autoReconnect && !this.intentionalDisconnect,
      attempt: (port) => this.openPort(port),
      onScheduled: () => {
        this.setStatus('reconnecting', this.lastError)
      },
      onExhausted: () => {
        this.setStatus('disconnected', 'auto_reconnect_failed')
      },
    })
  }

  getStatus(): SerialStatus {
    return this.status
  }

  getPort(): SerialPort | null {
    return this.active?.port ?? null
  }

  onStatus(listener: StatusListener): Unsubscribe {
    return this.hub.onStatus(listener)
  }

  onActivity(listener: (direction: SerialActivityDirection) => void): Unsubscribe {
    return this.hub.onActivity(listener)
  }

  subscribe<T = unknown>(discriminator: string, handler: Handler<T>): Unsubscribe {
    return this.hub.subscribe(discriminator, handler)
  }

  async connect(port?: SerialPort): Promise<void> {
    this.intentionalDisconnect = false
    this.reconnect.reset()

    if (this.active) {
      this.suppressNextReconnect = true
      await this.teardownPort()
    }

    const target = port ?? (await this.requestPort())
    if (!target) {
      const msg = 'no_port_selected'
      this.lastError = msg
      this.setStatus('disconnected', msg)
      throw new Error(msg)
    }

    return this.openPort(target)
  }

  disconnect(): void {
    this.intentionalDisconnect = true
    this.reconnect.cancel()
    this.acks.failPending('disconnected')
    this.acks.clearStaleFlush()
    this.acks.drainAllWithError('disconnected')
    const readLoopPromise = this.readLoop
    const own = this.active
    if (own) void bestEffort('[serial] reader.cancel', () => own.reader.cancel())
    void (readLoopPromise ?? Promise.resolve()).finally(() => {
      this.setStatus('disconnected')
    })
  }

  send(
    cmd: number,
    fields: Record<string, unknown> = {},
    opts: SendOptions = {}
  ): Promise<AckResult> {
    return this.acks.send(cmd, fields, opts)
  }

  private async writePayload(payload: string): Promise<void> {
    const writer = this.active?.writer
    if (!writer) throw new Error('not_connected')
    await writer.write(ENCODER.encode(payload))
    this.hub.emitActivity('tx')
  }

  private async deassertResetSignals(port: SerialPort): Promise<void> {
    const setSignals = (
      port as {
        setSignals?: (signals: {
          dataTerminalReady?: boolean
          requestToSend?: boolean
        }) => Promise<void>
      }
    ).setSignals
    if (typeof setSignals !== 'function') return
    await bestEffort('[serial] setSignals', () =>
      setSignals.call(port, { dataTerminalReady: false, requestToSend: false })
    )
  }

  private async requestPort(): Promise<SerialPort | null> {
    if (typeof navigator === 'undefined' || !navigator.serial) {
      throw new Error('webserial_unavailable')
    }
    try {
      return await navigator.serial.requestPort()
    } catch {
      return null
    }
  }

  private async openPort(port: SerialPort): Promise<void> {
    this.setStatus(this.reconnect.isBackedOff() ? 'reconnecting' : 'connecting')
    try {
      await port.open({ baudRate: this.baudRate })
      await this.deassertResetSignals(port)
    } catch (err) {
      const raw = errorMessage(err, 'open_failed')
      const msg = humanizeTransportError(raw)
      this.lastError = msg
      this.setStatus('disconnected', msg)
      throw new Error(msg, { cause: err })
    }

    if (!port.readable || !port.writable) {
      const msg = 'streams_unavailable'
      this.lastError = msg
      this.setStatus('disconnected', msg)
      await this.safeClose(port)
      throw new Error(msg)
    }

    const own: PortHandles = {
      port,
      reader: port.readable.getReader(),
      writer: port.writable.getWriter(),
    }
    this.active = own
    this.framer.reset()
    this.acks.clearStaleFlush()
    this.reconnect.noteOpened()
    this.lastError = undefined
    this.setStatus('connected')

    this.readLoop = bestEffort('[serial] readLoop', () => this.runReadLoop(own))
  }

  private dispatchChunk(value: Uint8Array | undefined): void {
    if (!value || value.byteLength === 0) return
    for (const line of this.framer.push(value)) this.onFrame(line)
  }

  private async runReadLoop(own: PortHandles): Promise<void> {
    try {
      while (true) {
        const { value, done } = await own.reader.read()
        if (done) break
        this.dispatchChunk(value)
      }
    } catch (err) {
      this.lastError = errorMessage(err, 'read_error')
    } finally {
      await this.finishReadLoop(own)
    }
  }

  private async finishReadLoop(own: PortHandles): Promise<void> {
    await bestEffort('[serial] final drain', () => {
      for (const line of this.framer.finish()) this.onFrame(line)
    })
    await this.releaseHandles(own)
    if (!this.isSuperseded(own)) this.handleClose(own)
  }

  private isSuperseded(own: PortHandles): boolean {
    return this.active !== null && this.active !== own
  }

  private async releaseHandles(own: PortHandles): Promise<void> {
    await bestEffort('[serial] reader.cancel', () => own.reader.cancel())
    await bestEffort('[serial] reader.releaseLock', () => {
      own.reader.releaseLock()
    })
    await bestEffort('[serial] writer.abort', () => own.writer.abort())
    await bestEffort('[serial] writer.releaseLock', () => {
      own.writer.releaseLock()
    })
  }

  private onFrame(raw: string): void {
    const parsed = safeJsonParse(raw)
    if (!isRecord(parsed)) return
    this.hub.emitActivity('rx')
    if (this.acks.routeAck(parsed)) return
    this.hub.routeSubscription(parsed)
  }

  private handleClose(own: PortHandles): void {
    void this.safeClose(own.port)

    if (this.suppressNextReconnect) {
      this.suppressNextReconnect = false
      return
    }
    if (this.isSuperseded(own)) return

    this.acks.failPending('connection_closed')
    this.acks.clearStaleFlush()
    this.acks.drainAllWithError('connection_closed')
    const wasConnected = this.status === 'connected'
    this.active = null
    this.readLoop = null

    if (this.intentionalDisconnect) {
      this.setStatus('disconnected')
      return
    }
    this.setStatus('disconnected', this.lastError ?? 'connection_closed')
    this.reconnect.handleClose(own.port, wasConnected)
  }

  private async teardownPort(): Promise<void> {
    const own = this.active
    if (!own) return
    this.active = null
    const loop = this.readLoop
    this.readLoop = null

    await bestEffort('[serial] reader.cancel', () => own.reader.cancel())
    await loop
  }

  private async safeClose(port: SerialPort): Promise<void> {
    await bestEffort('[serial] port.close', () => port.close())
  }

  private setStatus(next: SerialStatus, error?: string): void {
    if (this.status === next && this.lastError === error) return
    this.status = next
    if (error !== undefined) this.lastError = error
    this.hub.emitStatus(next, this.lastError)
  }
}

let singleton: SerialClient | null = null

export const getSerialClient = (): SerialClient => {
  singleton ??= new SerialClient()
  return singleton
}

export const __resetSerialClientSingleton = (): void => {
  if (singleton) singleton.disconnect()
  singleton = null
}
