import type { DashboardConfig } from '@canshift/core'
import { canonicalStringify } from './canonical-json'
import { usbService } from '../transport'
import type { ConfigReloadState } from '../transport/types'

export type VerifyResult =
  | { kind: 'ok' }
  | { kind: 'unreachable' }
  | { kind: 'fetch_failed'; error: string }
  | { kind: 'mismatch' }
  | { kind: 'refused' }

type Settled = { alive: false } | { alive: true; reload: ConfigReloadState | null }

const POLL_INTERVAL_MS = 250
const PING_TIMEOUT_MS = 1_000

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const pollUntilSettled = async (maxWaitMs: number): Promise<Settled> => {
  const deadline = Date.now() + maxWaitMs
  let settled: Settled = { alive: false }
  while (Date.now() < deadline) {
    const result = await usbService.ping(PING_TIMEOUT_MS)
    if (result.kind === 'ok') settled = { alive: true, reload: result.configReload }
    if (settled.alive && settled.reload !== 'pending') return settled
    await sleep(POLL_INTERVAL_MS)
  }
  return settled
}

const compareStored = async (expected: DashboardConfig): Promise<VerifyResult> => {
  const fetched = await usbService.getConfig()
  if (fetched.kind === 'error') return { kind: 'fetch_failed', error: fetched.error }
  if (canonicalStringify(fetched.config) !== canonicalStringify(expected)) {
    return { kind: 'mismatch' }
  }
  return { kind: 'ok' }
}

export const verifyBurnedConfig = async (
  expected: DashboardConfig,
  maxWaitMs = 5_000
): Promise<VerifyResult> => {
  const settled = await pollUntilSettled(maxWaitMs)
  if (!settled.alive) return { kind: 'unreachable' }
  if (settled.reload === 'refused') return { kind: 'refused' }
  return compareStored(expected)
}
