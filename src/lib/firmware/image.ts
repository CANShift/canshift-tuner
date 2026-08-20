const ESP_IMAGE_MAGIC = 0xe9
const BOOTLOADER_FLASH_OFFSET = 0x1000
const APP_DESC_MAGIC = 0xabcd5432
const APP_DESC_OFFSET = 0x20
const APP_DESC_BYTES = 256
const MIN_APP_IMAGE_BYTES = APP_DESC_OFFSET + APP_DESC_BYTES

export class InvalidFirmwareImageError extends Error {
  readonly firstByte: number
  constructor(firstByte: number) {
    const hex = firstByte.toString(16).padStart(2, '0').toUpperCase()
    const magicHex = ESP_IMAGE_MAGIC.toString(16).toUpperCase()
    const bootHex = BOOTLOADER_FLASH_OFFSET.toString(16).toUpperCase()
    super(
      `Not an ESP32 firmware image — expected magic byte 0x${magicHex} at offset 0 or 0x${bootHex}, got 0x${hex} at offset 0. Pick a .bin built for ESP32 (bootloader / app / firmware / merged).`
    )
    this.name = 'InvalidFirmwareImageError'
    this.firstByte = firstByte
  }
}

export const verifyImageMagic = (bytes: Uint8Array): void => {
  if (bytes.byteLength === 0) {
    throw new InvalidFirmwareImageError(0)
  }
  if (bytes[0] === ESP_IMAGE_MAGIC) return
  if (
    bytes.byteLength > BOOTLOADER_FLASH_OFFSET &&
    bytes[BOOTLOADER_FLASH_OFFSET] === ESP_IMAGE_MAGIC
  ) {
    return
  }
  throw new InvalidFirmwareImageError(bytes[0] ?? 0)
}

export type AppImageRejection = 'too-small' | 'not-an-esp-image' | 'not-app-only'

const APP_IMAGE_MESSAGE: Record<AppImageRejection, string> = {
  'too-small': 'OTA needs the app-only firmware.bin — this file is too small to be one.',
  'not-an-esp-image': 'OTA needs the app-only firmware.bin — this file is not an ESP32 image.',
  'not-app-only':
    'OTA needs the app-only firmware.bin — this file carries no app descriptor, so it is a merged or bootloader image. Pick the firmware.bin build, or disconnect the tuner to write merged bytes with the BOOT-button flasher.',
}

export class NotAnAppImageError extends Error {
  readonly rejection: AppImageRejection
  constructor(rejection: AppImageRejection) {
    super(APP_IMAGE_MESSAGE[rejection])
    this.name = 'NotAnAppImageError'
    this.rejection = rejection
  }
}

const readUint32LE = (bytes: Uint8Array, offset: number): number =>
  new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true)

export const verifyAppImage = (bytes: Uint8Array): void => {
  if (bytes.byteLength < MIN_APP_IMAGE_BYTES) {
    throw new NotAnAppImageError('too-small')
  }
  if (bytes[0] !== ESP_IMAGE_MAGIC) {
    throw new NotAnAppImageError('not-an-esp-image')
  }
  if (readUint32LE(bytes, APP_DESC_OFFSET) !== APP_DESC_MAGIC) {
    throw new NotAnAppImageError('not-app-only')
  }
}
