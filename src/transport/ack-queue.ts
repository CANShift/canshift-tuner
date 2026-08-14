import { bestEffort } from './best-effort'
import { errorMessage } from '../lib/error-message'

const ACK_TIMEOUT_MS = 5_000
const UNHEARD_DEVICE_TIMEOUT_MS = 20_000
const PUT_CONFIG_BASE_TIMEOUT_MS = ACK_TIMEOUT_MS
const PUT_CONFIG_PER_KB_MS = 50
const PUT_CONFIG_MAX_TIMEOUT_MS = 60_000
const BYTES_PER_KB = 1024
const STALE_ACK_FLUSH_MS = 1_000
const SEND_QUEUE_CAPACITY = 8

export interface SendOptions {
  timeoutMs?: number
  scaleWithPayload?: boolean
}

export interface AckResult {
  ok: boolean
  data?: Record<string, unknown>
  error?: string
}

interface PendingAck {
  resolve: (result: AckResult) => void
  timer: ReturnType<typeof setTimeout>
}

interface QueuedSend {
  cmd: number
  fields: Record<string, unknown>
  opts: SendOptions
  resolve: (result: AckResult) => void
}

export interface AckQueueDeps {
  canSend: () => boolean
  write: (payload: string) => Promise<void>
  deviceHeard?: () => boolean
}

export const putConfigTimeoutMs = (payloadBytes: number): number => {
  const sizeKB = payloadBytes / BYTES_PER_KB
  const scaled = Math.ceil(sizeKB * PUT_CONFIG_PER_KB_MS) + PUT_CONFIG_BASE_TIMEOUT_MS
  return Math.min(PUT_CONFIG_MAX_TIMEOUT_MS, Math.max(PUT_CONFIG_BASE_TIMEOUT_MS, scaled))
}

export class AckQueue {
  private pendingAck: PendingAck | null = null
  private pendingSends: QueuedSend[] = []
  private staleAckDiscards = 0
  private staleAckFlushTimer: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly deps: AckQueueDeps) {}

  send(
    cmd: number,
    fields: Record<string, unknown> = {},
    opts: SendOptions = {}
  ): Promise<AckResult> {
    if (!this.deps.canSend()) {
      return Promise.resolve({ ok: false, error: 'not_connected' })
    }
    if (this.pendingAck || this.staleAckDiscards > 0) {
      if (this.pendingSends.length >= SEND_QUEUE_CAPACITY) {
        return Promise.resolve({ ok: false, error: 'queue_full' })
      }
      return new Promise<AckResult>((resolve) => {
        this.pendingSends.push({ cmd, fields, opts, resolve })
      })
    }
    return this.dispatch(cmd, fields, opts)
  }

  routeAck(parsed: Record<string, unknown>): boolean {
    if (!('status' in parsed)) return false
    if (this.staleAckDiscards > 0) {
      console.warn('[serial] discarded stale status frame after ack_timeout')
      this.consumeStaleAck()
      return true
    }
    const ack = this.pendingAck
    if (!ack) return false
    this.pendingAck = null
    clearTimeout(ack.timer)
    if (parsed.status === 'ok') {
      ack.resolve({ ok: true, data: parsed })
    } else {
      const msg = typeof parsed.message === 'string' ? parsed.message : 'device_error'
      ack.resolve({ ok: false, error: msg, data: parsed })
    }
    this.drainQueued()
    return true
  }

  failPending(reason: string): void {
    if (!this.pendingAck) return
    const ack = this.pendingAck
    this.pendingAck = null
    clearTimeout(ack.timer)
    ack.resolve({ ok: false, error: reason })
  }

  drainAllWithError(reason: string): void {
    const pending = this.pendingSends
    this.pendingSends = []
    for (const entry of pending) entry.resolve({ ok: false, error: reason })
  }

  clearStaleFlush(): void {
    this.staleAckDiscards = 0
    if (this.staleAckFlushTimer) {
      clearTimeout(this.staleAckFlushTimer)
      this.staleAckFlushTimer = null
    }
  }

  private idleTimeoutMs(): number {
    const heard = this.deps.deviceHeard?.() ?? true
    return heard ? ACK_TIMEOUT_MS : UNHEARD_DEVICE_TIMEOUT_MS
  }

  private dispatch(
    cmd: number,
    fields: Record<string, unknown>,
    opts: SendOptions
  ): Promise<AckResult> {
    const payload = JSON.stringify({ cmd, ...fields }) + '\n'
    const timeoutMs = opts.scaleWithPayload
      ? putConfigTimeoutMs(payload.length)
      : (opts.timeoutMs ?? this.idleTimeoutMs())

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pendingAck = null
        this.beginStaleFlush()
        resolve({ ok: false, error: 'ack_timeout' })
      }, timeoutMs)

      this.pendingAck = { resolve, timer }

      this.deps.write(payload).catch((err: unknown) => {
        clearTimeout(timer)
        this.pendingAck = null
        resolve({ ok: false, error: errorMessage(err, 'send_failed') })
        this.drainQueued()
      })
    })
  }

  private drainQueued(): void {
    if (this.pendingAck || this.staleAckDiscards > 0) return
    const next = this.pendingSends.shift()
    if (!next) return
    if (!this.deps.canSend()) {
      next.resolve({ ok: false, error: 'not_connected' })
      this.drainQueued()
      return
    }
    void bestEffort('[serial] queued send', () =>
      this.dispatch(next.cmd, next.fields, next.opts).then(next.resolve)
    )
  }

  private beginStaleFlush(): void {
    this.staleAckDiscards += 1
    if (this.staleAckFlushTimer) clearTimeout(this.staleAckFlushTimer)
    this.staleAckFlushTimer = setTimeout(() => {
      this.staleAckFlushTimer = null
      this.staleAckDiscards = 0
      this.drainQueued()
    }, STALE_ACK_FLUSH_MS)
  }

  private consumeStaleAck(): void {
    this.staleAckDiscards -= 1
    if (this.staleAckDiscards > 0) return
    this.clearStaleFlush()
    this.drainQueued()
  }
}
