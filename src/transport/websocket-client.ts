import { AckQueue } from './ack-queue'
import { createContentionWatch } from './contention'
import { createKeepAlive } from './keep-alive'
import { ReconnectScheduler } from './reconnect-scheduler'
import { SerialEventHub } from './serial-events'
import { parseFrame } from './frame-parse'
import type { AckResult, SendOptions } from './ack-queue'
import type { DeviceLink } from './device-link'
import type { SerialActivityDirection, SerialStatus, StatusListener } from './serial-events'

export type SocketFactory = (url: string) => WebSocket

const OPEN = 1
export const CLOSE_BUSY = 4001

const defaultFactory: SocketFactory = (url) => new WebSocket(url)

export class WebSocketClient implements DeviceLink {
  readonly kind = 'wifi'
  private socket: WebSocket | null = null
  private opening: Promise<void> | null = null
  private status: SerialStatus = 'disconnected'
  private lastError: string | undefined
  private intentionalDisconnect = false
  private deviceHeard = false
  private readonly hub = new SerialEventHub()
  private readonly acks: AckQueue
  private readonly reconnect: ReconnectScheduler<string>
  private readonly contention = createContentionWatch()
  private readonly keepAlive = createKeepAlive()

  constructor(
    private readonly url: string,
    private readonly createSocket: SocketFactory = defaultFactory
  ) {
    this.acks = new AckQueue({
      canSend: () => this.socket?.readyState === OPEN && this.status === 'connected',
      write: (payload) => this.write(payload),
      deviceHeard: () => this.deviceHeard,
    })
    this.reconnect = new ReconnectScheduler<string>({
      enabled: () => !this.intentionalDisconnect,
      attempt: (target) => this.open(target),
      onScheduled: () => {
        this.setStatus('reconnecting', this.lastError)
      },
      onExhausted: () => {
        this.setStatus('disconnected', 'auto_reconnect_failed')
      },
    })
  }

  getStatus = (): SerialStatus => this.status

  onStatus = (listener: StatusListener): (() => void) => this.hub.onStatus(listener)

  onActivity = (listener: (direction: SerialActivityDirection) => void): (() => void) =>
    this.hub.onActivity(listener)

  subscribe = <T = unknown>(discriminator: string, handler: (event: T) => void): (() => void) =>
    this.hub.subscribe(discriminator, handler)

  send = (cmd: number, fields: Record<string, unknown> = {}, opts: SendOptions = {}) =>
    this.acks.send(cmd, fields, opts) satisfies Promise<AckResult>

  connect = (): Promise<void> => {
    if (this.socket !== null) return Promise.resolve()
    if (this.opening !== null) return this.opening
    this.intentionalDisconnect = false
    this.reconnect.reset()
    this.contention.reset()
    this.opening = this.open(this.url).finally(() => {
      this.opening = null
    })
    return this.opening
  }

  autoConnect = (): Promise<void> => this.connect().catch(() => undefined)

  disconnect = (): void => {
    this.keepAlive.stop()
    this.intentionalDisconnect = true
    this.reconnect.cancel()
    this.failAll('disconnected')
    const socket = this.socket
    this.socket = null
    socket?.close()
    this.setStatus('disconnected')
  }

  private open(url: string): Promise<void> {
    this.setStatus(this.reconnect.isBackedOff() ? 'reconnecting' : 'connecting')
    return new Promise((resolve, reject) => {
      const socket = this.createSocket(url)
      let opened = false
      socket.onopen = () => {
        opened = true
        this.adopt(socket)
        resolve()
      }
      socket.onmessage = (event: MessageEvent) => {
        this.onMessage(event.data)
      }
      socket.onclose = (event?: CloseEvent) => {
        if (event?.code === CLOSE_BUSY) {
          this.refuseAsBusy(socket)
          reject(new Error('replaced'))
          return
        }
        if (!opened) {
          this.failToOpen(reject)
          return
        }
        this.handleClose(socket)
      }
    })
  }

  private adopt(socket: WebSocket): void {
    this.socket = socket
    this.deviceHeard = false
    this.acks.clearStaleFlush()
    this.reconnect.noteOpened()
    this.keepAlive.start(() => {
      this.beat(socket)
    })
    this.lastError = undefined
    this.setStatus('connected')
  }

  private write(payload: string): Promise<void> {
    const socket = this.socket
    if (socket?.readyState !== OPEN) return Promise.reject(new Error('not_connected'))
    socket.send(payload.trimEnd())
    this.hub.emitActivity('tx')
    return Promise.resolve()
  }

  private onMessage(data: unknown): void {
    if (typeof data !== 'string') return
    this.deviceHeard = true
    for (const line of data.split('\n')) this.onFrame(line)
  }

  private onFrame(line: string): void {
    const parsed = parseFrame(line)
    if (parsed === null) return
    this.hub.emitActivity('rx')
    if (this.acks.routeAck(parsed)) return
    this.hub.routeSubscription(parsed)
  }

  private failToOpen(reject: (reason: Error) => void): void {
    this.setStatus(this.reconnect.isBackedOff() ? 'reconnecting' : 'disconnected', 'connect_failed')
    reject(new Error('connect_failed'))
  }

  private beat(socket: WebSocket): void {
    if (socket.readyState === OPEN) socket.send('')
  }

  private refuseAsBusy(socket: WebSocket): void {
    this.keepAlive.stop()
    if (this.socket === socket) this.socket = null
    this.failAll('connection_closed')
    this.reconnect.cancel()
    this.setStatus('disconnected', 'replaced')
  }

  private handleClose(socket: WebSocket): void {
    if (this.socket !== socket) return
    this.keepAlive.stop()
    this.socket = null
    this.failAll('connection_closed')
    if (this.intentionalDisconnect) {
      this.setStatus('disconnected')
      return
    }
    if (this.contention.noteDrop(Date.now())) {
      this.setStatus('disconnected', 'replaced')
      return
    }
    this.setStatus('disconnected', 'connection_closed')
    this.reconnect.handleClose(this.url, true)
  }

  private failAll(reason: string): void {
    this.acks.failPending(reason)
    this.acks.clearStaleFlush()
    this.acks.drainAllWithError(reason)
  }

  private setStatus(next: SerialStatus, error?: string): void {
    if (this.status === next && this.lastError === error) return
    this.status = next
    if (error !== undefined) this.lastError = error
    this.hub.emitStatus(next, this.lastError)
  }
}
