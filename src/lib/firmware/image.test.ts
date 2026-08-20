import { describe, it, expect } from 'vitest'

import { InvalidFirmwareImageError, NotAnAppImageError, verifyAppImage } from './image'

const ESP_IMAGE_MAGIC = 0xe9
const APP_DESC_MAGIC = 0xabcd5432
const APP_DESC_OFFSET = 0x20

const appImage = (size = 512): Uint8Array => {
  const bytes = new Uint8Array(size)
  bytes[0] = ESP_IMAGE_MAGIC
  new DataView(bytes.buffer).setUint32(APP_DESC_OFFSET, APP_DESC_MAGIC, true)
  return bytes
}

const bootloaderImage = (size = 512): Uint8Array => {
  const bytes = new Uint8Array(size)
  bytes[0] = ESP_IMAGE_MAGIC
  return bytes
}

const rejectionOf = (bytes: Uint8Array): string => {
  try {
    verifyAppImage(bytes)
  } catch (err: unknown) {
    if (err instanceof NotAnAppImageError) return err.rejection
    return `unexpected: ${String(err)}`
  }
  return 'accepted'
}

describe('verifyAppImage', () => {
  it('accepts an app-only image', () => {
    expect(rejectionOf(appImage())).toBe('accepted')
  })

  it('rejects a bootloader or merged image that has the ESP magic but no app descriptor', () => {
    expect(rejectionOf(bootloaderImage())).toBe('not-app-only')
  })

  it('rejects a merged image whose padding precedes the bootloader', () => {
    const merged = new Uint8Array(4096).fill(0xff)
    expect(rejectionOf(merged)).toBe('not-an-esp-image')
  })

  it('rejects a file that is not an ESP32 image at all', () => {
    expect(rejectionOf(new Uint8Array(512))).toBe('not-an-esp-image')
  })

  it('rejects a file too short to hold an app descriptor', () => {
    expect(rejectionOf(appImage().subarray(0, 64))).toBe('too-small')
  })

  it('reads the descriptor relative to a view offset, not the backing buffer', () => {
    const padded = new Uint8Array(1024)
    padded.set(appImage(), 512)
    expect(rejectionOf(padded.subarray(512))).toBe('accepted')
  })

  it('does not collide with InvalidFirmwareImageError', () => {
    let caught: unknown = null
    try {
      verifyAppImage(bootloaderImage())
    } catch (err: unknown) {
      caught = err
    }
    expect(caught).toBeInstanceOf(NotAnAppImageError)
    expect(caught).not.toBeInstanceOf(InvalidFirmwareImageError)
  })
})
