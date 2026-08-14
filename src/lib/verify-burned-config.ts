import type { DashboardConfig } from '@canshift/core'
import { canonicalStringify } from './canonical-json'
import { usbService } from '../transport'

export type VerifyResult =
  | { kind: 'ok' }
  | { kind: 'unreachable' }
  | { kind: 'fetch_failed'; error: string }
  | { kind: 'mismatch' }

const POLL_INTERVAL_MS = 250
const PING_TIMEOUT_MS = 1_000

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const pollUntilAlive = async (maxWaitMs: number): Promise<boolean> => {
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    const result = await usbService.ping(PING_TIMEOUT_MS)
    if (result.kind === 'ok') return true
    await sleep(POLL_INTERVAL_MS)
  }
  return false
}

export const verifyBurnedConfig = async (
  expected: DashboardConfig,
  maxWaitMs = 5_000
): Promise<VerifyResult> => {
  const alive = await pollUntilAlive(maxWaitMs)
  if (!alive) return { kind: 'unreachable' }

  const fetched = await usbService.getConfig()
  if (fetched.kind === 'error') return { kind: 'fetch_failed', error: fetched.error }

  if (canonicalStringify(fetched.config) !== canonicalStringify(expected)) {
    return { kind: 'mismatch' }
  }
  return { kind: 'ok' }
}
