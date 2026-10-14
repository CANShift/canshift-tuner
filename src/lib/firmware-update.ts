import { otaIpc } from '../transport/ota-ipc'
import type { AckResult } from '../transport/ack-queue'
import { otaErrorText } from './ota-errors'

export const OTA_CHUNK_BYTES = 512

export type UpdateResult = { kind: 'installed' } | { kind: 'failed'; message: string }

export type UpdateProgress = (sent: number, total: number) => void

const sha256Hex = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', bytes.slice().buffer)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const toBase64 = (chunk: Uint8Array): string => {
  let binary = ''
  for (const byte of chunk) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const failure = (ack: AckResult): UpdateResult => {
  const detail = ack.data?.detail
  return {
    kind: 'failed',
    message: otaErrorText(ack.error, typeof detail === 'string' ? detail : undefined),
  }
}

const sendChunks = async (
  bytes: Uint8Array,
  onProgress: UpdateProgress
): Promise<AckResult | null> => {
  for (let offset = 0; offset < bytes.byteLength; offset += OTA_CHUNK_BYTES) {
    const chunk = bytes.subarray(offset, offset + OTA_CHUNK_BYTES)
    const ack = await otaIpc.write(offset, toBase64(chunk))
    if (!ack.ok) return ack
    onProgress(offset + chunk.byteLength, bytes.byteLength)
  }
  return null
}

export const installFirmware = async (
  bytes: Uint8Array,
  signature: Uint8Array,
  onProgress: UpdateProgress
): Promise<UpdateResult> => {
  const begin = await otaIpc.begin(bytes.byteLength, await sha256Hex(bytes), toBase64(signature))
  if (!begin.ok) return failure(begin)
  const rejected = await sendChunks(bytes, onProgress)
  if (rejected !== null) {
    await otaIpc.abort()
    return failure(rejected)
  }
  const commit = await otaIpc.commit()
  return commit.ok ? { kind: 'installed' } : failure(commit)
}
