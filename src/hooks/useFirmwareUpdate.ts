import { useState } from 'react'
import { APP_IMAGE_REJECTIONS, checkAppImage, type AppImageInfo } from '../lib/firmware-image'
import { installFirmware } from '../lib/firmware-update'
import { errorMessage } from '../lib/error-message'
import { releaseLinkAfterInstall } from '../lib/firmware-restart'
import { useConnectionStore } from '../stores/connection.store'
import { useLogStore } from '../stores/log.store'
import { getDeviceLink } from '../transport/link'
import type { LinkKind } from '../transport/device-link'

export interface PickedImage {
  name: string
  bytes: Uint8Array
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
  pick: (file: File) => void
  install: () => void
}

const pickedState = (name: string, bytes: Uint8Array): FirmwareUpdateState => {
  const check = checkAppImage(bytes)
  if (check.kind === 'rejected') {
    return { kind: 'invalid', name, message: APP_IMAGE_REJECTIONS[check.rejection] }
  }
  return { kind: 'ready', image: { name, bytes, info: check.info } }
}

const imageOf = (state: FirmwareUpdateState): PickedImage | null =>
  'image' in state ? state.image : null

const readFile = async (file: File): Promise<FirmwareUpdateState> => {
  try {
    return pickedState(file.name, new Uint8Array(await file.arrayBuffer()))
  } catch (err) {
    return {
      kind: 'invalid',
      name: file.name,
      message: errorMessage(err, 'Could not read the file'),
    }
  }
}

const runInstall = async (
  image: PickedImage,
  setState: (state: FirmwareUpdateState) => void
): Promise<FirmwareUpdateState> => {
  setState({ kind: 'installing', image, sent: 0 })
  const result = await installFirmware(image.bytes, (sent) => {
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

  const pick = (file: File) => {
    void readFile(file).then(setState)
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
