import { otaIpc } from '../transport/ota-ipc'
import type { AckResult } from '../transport/ack-queue'
import { otaErrorText } from './ota-errors'

export const OTA_CHUNK_BYTES = 512

export type UpdateResult =
  | { kind: 'installed' }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string; code: string; detail: string | undefined }

export interface InstallHooks {
  onProgress: (sent: number, total: number) => void
  onCommitting?: () => void
  cancelled?: () => boolean
}

export interface FirmwarePackage {
  bytes: Uint8Array
  signature: Uint8Array
  version: string
}

const CANCELLED = 'cancelled'

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
  const raw = ack.data?.detail
  const detail = typeof raw === 'string' ? raw : undefined
  const code = ack.error ?? 'unknown_error'
  return { kind: 'failed', message: otaErrorText(code, detail), code, detail }
}

const sendChunks = async (bytes: Uint8Array, hooks: InstallHooks): Promise<AckResult | null> => {
  for (let offset = 0; offset < bytes.byteLength; offset += OTA_CHUNK_BYTES) {
    if (hooks.cancelled?.() === true) return { ok: false, error: CANCELLED }
    const chunk = bytes.subarray(offset, offset + OTA_CHUNK_BYTES)
    const ack = await otaIpc.write(offset, toBase64(chunk))
    if (!ack.ok) return ack
    hooks.onProgress(offset + chunk.byteLength, bytes.byteLength)
  }
  return null
}

const beginUpdate = async ({ bytes, signature, version }: FirmwarePackage): Promise<AckResult> =>
  otaIpc.begin(bytes.byteLength, await sha256Hex(bytes), toBase64(signature), version)

export const installFirmware = async (
  firmware: FirmwarePackage,
  hooks: InstallHooks
): Promise<UpdateResult> => {
  const begin = await beginUpdate(firmware)
  if (!begin.ok) return failure(begin)
  const rejected = await sendChunks(firmware.bytes, hooks)
  if (rejected !== null) {
    await otaIpc.abort()
    return rejected.error === CANCELLED ? { kind: 'cancelled' } : failure(rejected)
  }
  hooks.onCommitting?.()
  const commit = await otaIpc.commit()
  return commit.ok ? { kind: 'installed' } : failure(commit)
}
