import { useConnectionStore } from '../stores/connection.store'

const RECONNECT_TIMEOUT_MS = 150_000
const RECONNECT_RETRY_MS = 3_000

export interface WaitOptions {
  timeoutMs: number
  retryMs: number
  dropFirst: boolean
}

const DEFAULT_WAIT: WaitOptions = {
  timeoutMs: RECONNECT_TIMEOUT_MS,
  retryMs: RECONNECT_RETRY_MS,
  dropFirst: true,
}

export const waitForDash = (overrides: Partial<WaitOptions> = {}): Promise<boolean> =>
  new Promise((resolve) => {
    const options = { ...DEFAULT_WAIT, ...overrides }
    const started = Date.now()
    if (options.dropFirst) useConnectionStore.getState().disconnect()
    const timer = setInterval(() => {
      const { status, tryAutoReconnect } = useConnectionStore.getState()
      const done = status === 'connected' || Date.now() - started > options.timeoutMs
      if (done) {
        clearInterval(timer)
        resolve(status === 'connected')
        return
      }
      if (status === 'disconnected') void tryAutoReconnect()
    }, options.retryMs)
  })
