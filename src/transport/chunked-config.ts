import type { DashboardConfig } from '@canshift/core'

import { CMD_PUT_CONFIG_CHUNK } from './opcodes'
import { getSerialClient } from './webserial-client'

const CHUNK_BYTES = 512
const CHUNK_ACK_TIMEOUT_MS = 10_000
const COMMIT_ACK_TIMEOUT_MS = 30_000

export interface ChunkedBurnResult {
  success: boolean
  error?: string
}

const toBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const splitIntoChunks = (bytes: Uint8Array): Uint8Array[] => {
  const chunks: Uint8Array[] = []
  for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
    chunks.push(bytes.subarray(offset, offset + CHUNK_BYTES))
  }
  return chunks
}

export const burnConfigChunked = async (config: DashboardConfig): Promise<ChunkedBurnResult> => {
  const payload = new TextEncoder().encode(JSON.stringify(config))
  const chunks = splitIntoChunks(payload)
  if (chunks.length === 0) {
    return { success: false, error: 'empty_config' }
  }
  const client = getSerialClient()

  for (const [idx, chunk] of chunks.entries()) {
    const isLast = idx === chunks.length - 1
    const fields: Record<string, unknown> = { total: chunks.length, idx, data: toBase64(chunk) }
    if (idx === 0) fields.bytes = payload.length
    const ack = await client.send(CMD_PUT_CONFIG_CHUNK, fields, {
      timeoutMs: isLast ? COMMIT_ACK_TIMEOUT_MS : CHUNK_ACK_TIMEOUT_MS,
    })
    if (!ack.ok) {
      return { success: false, error: ack.error ?? 'chunk_rejected' }
    }
  }
  return { success: true }
}
