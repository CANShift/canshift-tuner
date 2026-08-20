import { getSerialClient } from '../../transport/webserial-client'
import type { AckResult } from '../../transport/ack-queue'
import { CMD_OTA_BEGIN, CMD_OTA_END, CMD_OTA_WRITE } from '../../transport/opcodes'
import { verifyAppImage } from './image'
import { otaErrorText } from './ota-errors'

const CHUNK_SIZE = 512
const ACK_TIMEOUT_MS = 8_000
const COMMIT_TIMEOUT_MS = 5_000

export type OtaProgress = (sent: number, total: number) => void
export type OtaLog = (line: string) => void

export interface OtaOptions {
  bytes: Uint8Array
  onProgress: OtaProgress
  onLog: OtaLog
}

export class OtaError extends Error {
  readonly cause: unknown
  constructor(message: string, cause: unknown = null) {
    super(message)
    this.name = 'OtaError'
    this.cause = cause
  }
}

const sha256Hex = async (bytes: Uint8Array): Promise<string> => {
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  const digest = await crypto.subtle.digest('SHA-256', buf as ArrayBuffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const toBase64 = (chunk: Uint8Array): string => {
  let binary = ''
  for (const byte of chunk) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const ackField = (ack: AckResult, key: string): string | undefined => {
  const value = ack.data?.[key]
  return value === undefined ? undefined : String(value)
}

const rejection = (stage: string, ack: AckResult, onLog: OtaLog): OtaError => {
  const detail = ackField(ack, 'detail')
  const written = ackField(ack, 'written')
  const suffix = written === undefined ? '' : ` written=${written}`
  onLog(
    `${stage} rejected: ${ack.error ?? 'unknown'}${detail === undefined ? '' : ` ${detail}`}${suffix}`
  )
  return new OtaError(otaErrorText(ack.error, detail), ack)
}

export const flashFirmwareOta = async ({ bytes, onProgress, onLog }: OtaOptions): Promise<void> => {
  verifyAppImage(bytes)
  const client = getSerialClient()

  const sha = await sha256Hex(bytes)
  onLog(`OTA begin: ${String(bytes.byteLength)} bytes, sha256=${sha.slice(0, 16)}…`)
  const beginAck = await client.send(
    CMD_OTA_BEGIN,
    { total: bytes.byteLength, sha256: sha },
    { timeoutMs: ACK_TIMEOUT_MS }
  )
  if (!beginAck.ok) {
    throw rejection('OTA_BEGIN', beginAck, onLog)
  }

  let offset = 0
  while (offset < bytes.byteLength) {
    const end = Math.min(offset + CHUNK_SIZE, bytes.byteLength)
    const chunk = bytes.subarray(offset, end)
    const b64 = toBase64(chunk)
    const ack = await client.send(
      CMD_OTA_WRITE,
      { offset, data: b64 },
      { timeoutMs: ACK_TIMEOUT_MS, scaleWithPayload: true }
    )
    if (!ack.ok) {
      throw rejection(`OTA_WRITE at offset ${String(offset)}`, ack, onLog)
    }
    offset = end
    onProgress(offset, bytes.byteLength)
  }

  onLog('OTA commit — dash will restart')
  const commitAck = await client.send(
    CMD_OTA_END,
    { action: 'commit' },
    { timeoutMs: COMMIT_TIMEOUT_MS }
  )
  if (!commitAck.ok) {
    throw rejection('OTA_END commit', commitAck, onLog)
  }
}
