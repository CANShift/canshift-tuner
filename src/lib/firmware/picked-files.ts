import { APP_IMAGE_REJECTIONS, checkAppImage, type AppImageInfo } from '../firmware-image'
import { FIRMWARE_FILES_REJECTIONS, SIGNATURE_BYTES } from '../firmware-files'

export interface PickedBin {
  name: string
  bytes: Uint8Array
  info: AppImageInfo
}

export interface PickedSig {
  name: string
  bytes: Uint8Array
}

export type Picked<T> = { kind: 'ok'; file: T } | { kind: 'rejected'; message: string }

export const pickedBin = (name: string, bytes: Uint8Array): Picked<PickedBin> => {
  const check = checkAppImage(bytes)
  if (check.kind === 'rejected')
    return { kind: 'rejected', message: APP_IMAGE_REJECTIONS[check.rejection] }
  return { kind: 'ok', file: { name, bytes, info: check.info } }
}

export const pickedSig = (name: string, bytes: Uint8Array): Picked<PickedSig> =>
  bytes.byteLength === SIGNATURE_BYTES
    ? { kind: 'ok', file: { name, bytes } }
    : { kind: 'rejected', message: FIRMWARE_FILES_REJECTIONS['bad-signature'] }
