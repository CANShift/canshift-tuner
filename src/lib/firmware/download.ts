import type { ReleaseAsset } from '@canshift/core'
import { computeSha256Hex } from './hash'
import { verifyImageMagic } from './image'
import { FIRMWARE_MAX_BYTES, LocalFirmwareError } from './local-firmware'
import type { LocalFirmware } from './local-firmware'

const DIGEST_PREFIX = 'sha256:'
const SHA256_HEX_RE = /^[0-9a-f]{64}$/
const HEADERS_TIMEOUT_MS = 30_000
const STALL_TIMEOUT_MS = 15_000

export type DownloadProgress = (loaded: number, total: number) => void

const PROXY_PATH = '/api/firmware-download'

export const firmwareAssetProxyUrl = (downloadUrl: string): string => {
  const u = new URL(downloadUrl)
  const parts = u.pathname.split('/').filter(Boolean)
  const tag = parts[4]
  const asset = parts[5]
  if (!tag || !asset) {
    throw new Error(`Unrecognised release URL shape: ${downloadUrl}`)
  }
  const params = new URLSearchParams({ tag, asset })
  return `${PROXY_PATH}?${params.toString()}`
}

const expectedDigestHex = (asset: ReleaseAsset): string => {
  const raw = asset.digest
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error(
      `No checksum published for ${asset.name} — refusing to flash an image that cannot be verified.`
    )
  }
  const hex = (raw.startsWith(DIGEST_PREFIX) ? raw.slice(DIGEST_PREFIX.length) : raw).toLowerCase()
  if (!SHA256_HEX_RE.test(hex)) {
    throw new Error(`Unusable checksum published for ${asset.name}: ${raw}`)
  }
  return hex
}

const oversized = (received: number): LocalFirmwareError =>
  new LocalFirmwareError(
    'too-large',
    `Download exceeded ${String(FIRMWARE_MAX_BYTES)} bytes (${String(received)} received) — aborted.`
  )

export const downloadFirmwareAsset = async (
  asset: ReleaseAsset,
  onProgress?: DownloadProgress
): Promise<LocalFirmware> => {
  if (asset.sizeBytes > FIRMWARE_MAX_BYTES) {
    throw new LocalFirmwareError(
      'too-large',
      `Release asset is ${String(asset.sizeBytes)} bytes — refusing anything over ${String(FIRMWARE_MAX_BYTES)}.`
    )
  }

  const expected = expectedDigestHex(asset)
  const proxyUrl = firmwareAssetProxyUrl(asset.downloadUrl)

  const controller = new AbortController()
  let timedOut = false
  const abortAsTimeout = (): void => {
    timedOut = true
    controller.abort()
  }
  let watchdog = setTimeout(abortAsTimeout, HEADERS_TIMEOUT_MS)
  const arm = (ms: number): void => {
    clearTimeout(watchdog)
    watchdog = setTimeout(abortAsTimeout, ms)
  }

  let bytes: Uint8Array
  try {
    const response = await fetch(proxyUrl, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Download failed: HTTP ${String(response.status)}`)
    }
    arm(STALL_TIMEOUT_MS)
    bytes = await readWithProgress(
      response,
      asset.sizeBytes,
      () => {
        arm(STALL_TIMEOUT_MS)
      },
      onProgress
    )
  } catch (err) {
    if (timedOut) {
      throw new Error(
        `Download stalled — no data for ${String(STALL_TIMEOUT_MS / 1000)} s. Check the connection and retry.`,
        { cause: err }
      )
    }
    throw err
  } finally {
    clearTimeout(watchdog)
  }

  if (bytes.byteLength === 0) {
    throw new LocalFirmwareError('empty', 'Downloaded firmware is empty.')
  }

  verifyImageMagic(bytes)
  const sha256 = await computeSha256Hex(bytes)
  if (expected !== sha256) {
    throw new Error(
      `Checksum mismatch — expected ${expected.slice(0, 12)}…, got ${sha256.slice(0, 12)}…`
    )
  }

  return { name: asset.name, size: bytes.byteLength, bytes, sha256 }
}

const readWithProgress = async (
  response: Response,
  expectedSize: number,
  onChunk: () => void,
  onProgress?: DownloadProgress
): Promise<Uint8Array> => {
  const reader = response.body?.getReader()
  if (!reader) {
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > FIRMWARE_MAX_BYTES) throw oversized(buffer.byteLength)
    onProgress?.(buffer.byteLength, expectedSize)
    return new Uint8Array(buffer)
  }
  const chunks: Uint8Array[] = []
  let received = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > FIRMWARE_MAX_BYTES) {
      await reader.cancel()
      throw oversized(received)
    }
    chunks.push(value)
    onChunk()
    onProgress?.(received, expectedSize)
  }
  const out = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.byteLength
  }
  return out
}
