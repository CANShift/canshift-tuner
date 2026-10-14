import { describe, expect, it } from 'vitest'
import { pairFirmwareFiles, SIGNATURE_BYTES } from './firmware-files'

const file = (name: string, bytes = 16): File => new File([new Uint8Array(bytes)], name)

const IMAGE = file('canshift-esp32s3-v1.0.0-firmware.bin')
const SIGNATURE = file('canshift-esp32s3-v1.0.0-firmware.bin.sig', SIGNATURE_BYTES)

describe('pairFirmwareFiles', () => {
  it('pairs a .bin with its .sig in any order', () => {
    expect(pairFirmwareFiles([SIGNATURE, IMAGE])).toEqual({
      kind: 'paired',
      image: IMAGE,
      signature: SIGNATURE,
    })
  })

  it('refuses a .bin picked without its .sig', () => {
    expect(pairFirmwareFiles([IMAGE])).toEqual({ kind: 'rejected', rejection: 'no-signature' })
  })

  it('refuses a .sig picked without a .bin', () => {
    expect(pairFirmwareFiles([SIGNATURE])).toEqual({ kind: 'rejected', rejection: 'no-image' })
  })

  it('refuses a signature that is not 64 bytes', () => {
    const short = file('firmware.bin.sig', SIGNATURE_BYTES - 1)
    expect(pairFirmwareFiles([IMAGE, short])).toEqual({
      kind: 'rejected',
      rejection: 'bad-signature',
    })
  })

  it('refuses a pick with more than one image or a stray file', () => {
    const extra = [IMAGE, SIGNATURE, file('other.bin')]
    expect(pairFirmwareFiles(extra)).toEqual({ kind: 'rejected', rejection: 'extra-files' })
    expect(pairFirmwareFiles([IMAGE, SIGNATURE, file('notes.txt')]).kind).toBe('rejected')
  })
})
