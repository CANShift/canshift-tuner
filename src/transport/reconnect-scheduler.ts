export const RECONNECT_INITIAL_MS = 500
const RECONNECT_MAX_MS = 30_000
const RECONNECT_FACTOR = 2
const RECONNECT_MAX_ATTEMPTS = 6
const STABLE_UPTIME_MS = 10_000

export type ReconnectAction = 'idle' | 'reconnect' | 'reset-backoff'

export interface ReconnectContext {
  wasConnected: boolean
  backedOff: boolean
  openedAt: number | null
  now: number
}

export const nextReconnectAction = (ctx: ReconnectContext): ReconnectAction => {
  if (!ctx.wasConnected && !ctx.backedOff) return 'idle'
  const stableUptime = ctx.openedAt !== null && ctx.now - ctx.openedAt >= STABLE_UPTIME_MS
  return stableUptime ? 'reset-backoff' : 'reconnect'
}

export interface ReconnectSchedulerDeps {
  enabled: () => boolean
  attempt: (port: SerialPort) => Promise<void>
  onScheduled: () => void
  onExhausted: () => void
}

export class ReconnectScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null
  private delay = RECONNECT_INITIAL_MS
  private attempts = 0
  private openedAt: number | null = null

  constructor(private readonly deps: ReconnectSchedulerDeps) {}

  isBackedOff(): boolean {
    return this.delay > RECONNECT_INITIAL_MS
  }

  reset(): void {
    this.cancel()
    this.delay = RECONNECT_INITIAL_MS
    this.attempts = 0
    this.openedAt = null
  }

  noteOpened(): void {
    this.openedAt = Date.now()
    this.attempts = 0
  }

  handleClose(port: SerialPort | null, wasConnected: boolean): void {
    const action = nextReconnectAction({
      wasConnected,
      backedOff: this.isBackedOff(),
      openedAt: this.openedAt,
      now: Date.now(),
    })
    this.openedAt = null
    if (action === 'idle') return
    if (action === 'reset-backoff') this.delay = RECONNECT_INITIAL_MS
    this.schedule(port)
  }

  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private schedule(port: SerialPort | null): void {
    if (!this.deps.enabled()) return
    if (this.timer) return
    if (!port) return
    if (this.attempts >= RECONNECT_MAX_ATTEMPTS) {
      this.deps.onExhausted()
      return
    }

    this.deps.onScheduled()
    this.timer = setTimeout(() => {
      this.timer = null
      this.attempts += 1
      this.delay = Math.min(this.delay * RECONNECT_FACTOR, RECONNECT_MAX_MS)
      void this.deps.attempt(port).catch(() => {
        this.schedule(port)
      })
    }, this.delay)
  }
}
