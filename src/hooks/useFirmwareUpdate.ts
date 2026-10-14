import { useState } from 'react'
import { APP_IMAGE_REJECTIONS, checkAppImage, type AppImageInfo } from '../lib/firmware-image'
import { installFirmware } from '../lib/firmware-update'
import {
  FIRMWARE_FILES_REJECTIONS,
  pairFirmwareFiles,
  type PairedFiles,
} from '../lib/firmware-files'
import { errorMessage } from '../lib/error-message'
import { releaseLinkAfterInstall } from '../lib/firmware-restart'
import { useConnectionStore } from '../stores/connection.store'
import { useLogStore } from '../stores/log.store'
import { getDeviceLink } from '../transport/link'
import type { LinkKind } from '../transport/device-link'

export interface PickedImage {
  name: string
  signatureName: string
  bytes: Uint8Array
  signature: Uint8Array
  info: AppImageInfo
}

export type FirmwareUpdateState =
  | { kind: 'empty' }
  | { kind: 'invalid'; name: string; message: string }
  | { kind: 'ready'; image: PickedImage }
  | { kind: 'installing'; image: PickedImage; sent: number }
  | { kind: 'installed'; image: PickedImage; link: LinkKind }
  | { kind: 'failed'; image: PickedImage; message: string }

export interface FirmwareUpdate {
  state: FirmwareUpdateState
  pick: (files: readonly File[]) => void
  install: () => void
}

const invalid = (files: readonly File[], message: string): FirmwareUpdateState => ({
  kind: 'invalid',
  name: files.map((file) => file.name).join(', '),
  message,
})

const pickedState = (
  pair: PairedFiles,
  bytes: Uint8Array,
  signature: Uint8Array
): FirmwareUpdateState => {
  const check = checkAppImage(bytes)
  if (check.kind === 'rejected') {
    return invalid([pair.image], APP_IMAGE_REJECTIONS[check.rejection])
  }
  const names = { name: pair.image.name, signatureName: pair.signature.name }
  return { kind: 'ready', image: { ...names, bytes, signature, info: check.info } }
}

const imageOf = (state: FirmwareUpdateState): PickedImage | null =>
  'image' in state ? state.image : null

const bytesOf = async (file: File): Promise<Uint8Array> => new Uint8Array(await file.arrayBuffer())

const readFiles = async (files: readonly File[]): Promise<FirmwareUpdateState> => {
  const pair = pairFirmwareFiles(files)
  if (pair.kind === 'rejected') return invalid(files, FIRMWARE_FILES_REJECTIONS[pair.rejection])
  try {
    const [bytes, signature] = await Promise.all([bytesOf(pair.image), bytesOf(pair.signature)])
    return pickedState(pair, bytes, signature)
  } catch (err) {
    return invalid(files, errorMessage(err, 'Could not read the files'))
  }
}

const runInstall = async (
  image: PickedImage,
  setState: (state: FirmwareUpdateState) => void
): Promise<FirmwareUpdateState> => {
  setState({ kind: 'installing', image, sent: 0 })
  const result = await installFirmware(image.bytes, image.signature, (sent) => {
    setState({ kind: 'installing', image, sent })
  })
  if (result.kind === 'failed') return { kind: 'failed', image, message: result.message }
  const link = getDeviceLink().kind
  releaseLinkAfterInstall(link, useConnectionStore.getState().disconnectWithNotice)
  return { kind: 'installed', image, link }
}

export const useFirmwareUpdate = (): FirmwareUpdate => {
  const [state, setState] = useState<FirmwareUpdateState>({ kind: 'empty' })
  const log = useLogStore((s) => s.push)

  const pick = (files: readonly File[]) => {
    void readFiles(files).then(setState)
  }

  const install = () => {
    const image = imageOf(state)
    if (image === null || state.kind === 'installing') return
    log(
      'info',
      `Installing firmware ${image.info.version} (${String(image.bytes.byteLength)} bytes)`
    )
    void runInstall(image, setState).then(setState)
  }

  return { state, pick, install }
}
