import {
  CanFrameSchema,
  HeapStatsFrameWireSchema,
  LogFrameSchema,
  TeleFrameSchema,
  heapStatsFromWire,
} from '@canshift/core'
import type { ZodType } from 'zod'

import type { Handler, Unsubscribe } from './types'
import { isRecord } from './types'
import { getSerialClient } from './webserial-client'

const SEEN_SCHEMA_ERRORS_CAP = 100
const seenSchemaErrors = new Set<string>()

const warnFrameDrop = (discriminator: string, code: string, sample: string): void => {
  const key = `${discriminator}:${code}`
  if (seenSchemaErrors.has(key)) return
  if (seenSchemaErrors.size >= SEEN_SCHEMA_ERRORS_CAP) {
    const oldest = seenSchemaErrors.values().next().value
    if (oldest !== undefined) seenSchemaErrors.delete(oldest)
  }
  seenSchemaErrors.add(key)
  console.warn(`[serial] dropping ${discriminator} frame — ${code} (${sample})`)
}

const subscribeParsed = <Wire, Out>(
  discriminator: string,
  schema: ZodType<Wire>,
  map: (wire: Wire) => Out,
  handler: Handler<Out>
): Unsubscribe =>
  getSerialClient().subscribe(discriminator, (frame) => {
    const parsed = schema.safeParse(frame)
    if (!parsed.success) {
      warnFrameDrop(discriminator, parsed.error.issues[0]?.code ?? 'unknown', JSON.stringify(frame))
      return
    }
    handler(map(parsed.data))
  })

export const deviceEvents = {
  onLogLine: (handler: Handler<{ level: string; tag: string; message: string }>): Unsubscribe =>
    subscribeParsed(
      'log',
      LogFrameSchema,
      (wire) => ({ level: wire.lvl, tag: wire.tag, message: wire.msg }),
      handler
    ),

  onCanFrame: (handler: Handler<{ id: number; len: number; data: number[] }>): Unsubscribe =>
    subscribeParsed(
      'can',
      CanFrameSchema,
      (wire) => ({ id: wire.id, len: wire.len, data: wire.d }),
      handler
    ),

  onSignal: (handler: Handler<Record<string, number>>): Unsubscribe =>
    subscribeParsed('tele', TeleFrameSchema, (wire) => wire.v, handler),

  onHeapStats: (
    handler: Handler<{
      tsMs: number
      freeInternal: number
      largestInternal: number
      freePsram: number | null
      largestPsram: number | null
    }>
  ): Unsubscribe =>
    subscribeParsed('heap_stats', HeapStatsFrameWireSchema, heapStatsFromWire, handler),

  onCanHealth: (handler: Handler<{ fps: number; errors: number }>): Unsubscribe => {
    return getSerialClient().subscribe('can_stat', (frame) => {
      if (!isRecord(frame)) return
      handler({
        fps: typeof frame.fps === 'number' ? frame.fps : 0,
        errors: typeof frame.errors === 'number' ? frame.errors : 0,
      })
    })
  },

  onConnectionChange: (handler: Handler<{ connected: boolean; reason?: string }>): Unsubscribe => {
    return getSerialClient().onStatus((status, error) => {
      if (status === 'connected') {
        handler({ connected: true })
        return
      }
      if (error !== undefined) {
        handler({ connected: false, reason: error })
        return
      }
      handler({ connected: false })
    })
  },

  onActivity: (handler: Handler<'rx' | 'tx'>): Unsubscribe => {
    return getSerialClient().onActivity(handler)
  },
}
