import { describe, expect, it } from 'vitest'
import { checkAppImage } from './firmware-image'

const APP_DESC_OFFSET = 0x20

const appImage = (version = '0.21.0', size = 1024): Uint8Array => {
  const bytes = new Uint8Array(size)
  bytes[0] = 0xe9
  new DataView(bytes.buffer).setUint32(APP_DESC_OFFSET, 0xabcd5432, true)
  bytes.set(new TextEncoder().encode(version), APP_DESC_OFFSET + 16)
  bytes.set(new TextEncoder().encode('canshift'), APP_DESC_OFFSET + 48)
  return bytes
}

describe('checkAppImage', () => {
  it('reads the version and project from an app-only image', () => {
    expect(checkAppImage(appImage())).toEqual({
      kind: 'app',
      info: { version: '0.21.0', projectName: 'canshift' },
    })
  })

  it('rejects a merged image, whose first bytes are padding', () => {
    expect(checkAppImage(new Uint8Array(4096).fill(0xff))).toEqual({
      kind: 'rejected',
      rejection: 'not-an-esp-image',
    })
  })

  it('rejects a bootloader image, which has no app descriptor', () => {
    const bootloader = new Uint8Array(1024)
    bootloader[0] = 0xe9
    expect(checkAppImage(bootloader)).toEqual({ kind: 'rejected', rejection: 'not-app-only' })
  })

  it('rejects a file too small to hold an app descriptor', () => {
    expect(checkAppImage(new Uint8Array(16))).toEqual({ kind: 'rejected', rejection: 'too-small' })
  })
})
