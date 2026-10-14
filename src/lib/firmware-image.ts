const ESP_IMAGE_MAGIC = 0xe9
const APP_DESC_MAGIC = 0xabcd5432
const APP_DESC_OFFSET = 0x20
const APP_VERSION_OFFSET = APP_DESC_OFFSET + 16
const APP_NAME_OFFSET = APP_DESC_OFFSET + 48
const APP_TEXT_BYTES = 32
const APP_DESC_BYTES = 256
const MIN_APP_IMAGE_BYTES = APP_DESC_OFFSET + APP_DESC_BYTES

export type AppImageRejection = 'too-small' | 'not-an-esp-image' | 'not-app-only'

export interface AppImageInfo {
  version: string
  projectName: string
}

export type AppImageCheck =
  { kind: 'app'; info: AppImageInfo } | { kind: 'rejected'; rejection: AppImageRejection }

export const APP_IMAGE_REJECTIONS: Record<AppImageRejection, string> = {
  'too-small': 'This file is too small to be a firmware image.',
  'not-an-esp-image': 'This file is not an ESP32 firmware image.',
  'not-app-only':
    'This is a merged or bootloader image. Pick the app-only firmware .bin from the release.',
}

const readUint32LE = (bytes: Uint8Array, offset: number): number =>
  new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true)

const readText = (bytes: Uint8Array, offset: number): string => {
  const field = bytes.subarray(offset, offset + APP_TEXT_BYTES)
  const end = field.indexOf(0)
  return new TextDecoder().decode(end === -1 ? field : field.subarray(0, end))
}

const rejectionOf = (bytes: Uint8Array): AppImageRejection | null => {
  if (bytes.byteLength < MIN_APP_IMAGE_BYTES) return 'too-small'
  if (bytes[0] !== ESP_IMAGE_MAGIC) return 'not-an-esp-image'
  if (readUint32LE(bytes, APP_DESC_OFFSET) !== APP_DESC_MAGIC) return 'not-app-only'
  return null
}

export const checkAppImage = (bytes: Uint8Array): AppImageCheck => {
  const rejection = rejectionOf(bytes)
  if (rejection !== null) return { kind: 'rejected', rejection }
  const info = {
    version: readText(bytes, APP_VERSION_OFFSET),
    projectName: readText(bytes, APP_NAME_OFFSET),
  }
  return { kind: 'app', info }
}
