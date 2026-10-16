import { create } from 'zustand'
import { installFirmware, type UpdateResult } from '../lib/firmware-update'
import { firmwareFailure, type FirmwareFailure } from '../lib/firmware/failure'
import {
  pickedBin,
  pickedSig,
  type Picked,
  type PickedBin,
  type PickedSig,
} from '../lib/firmware/picked-files'
import { waitForDash } from '../lib/wait-for-dash'
import { STRINGS } from '../strings'
import { useDeviceStore } from './device.store'

export type FirmwareStep = 'upload' | 'signature' | 'install' | 'restart'

export type FirmwareView =
  | { kind: 'choosing' }
  | { kind: 'confirming' }
  | { kind: 'running'; step: FirmwareStep; sent: number; total: number }
  | { kind: 'success' }
  | { kind: 'reconnect' }
  | { kind: 'failed'; failure: FirmwareFailure }

interface FirmwareState {
  bin: PickedBin | null
  sig: PickedSig | null
  problem: string | null
  view: FirmwareView
  runningVersion: string
  cancelRequested: boolean
  chooseBin: (file: File) => Promise<void>
  chooseSig: (file: File) => Promise<void>
  askToInstall: () => void
  backToChoosing: () => void
  install: () => Promise<void>
  cancelUpload: () => void
  finish: () => void
}

type Set = (patch: Partial<FirmwareState>) => void
type Get = () => FirmwareState

const bytesOf = async (file: File): Promise<Uint8Array> => new Uint8Array(await file.arrayBuffer())

const runningView = (step: FirmwareStep, sent: number, total: number): FirmwareView => ({
  kind: 'running',
  step,
  sent,
  total,
})

const choose =
  <T>(slot: 'bin' | 'sig', pick: (name: string, bytes: Uint8Array) => Picked<T>, set: Set) =>
  async (file: File): Promise<void> => {
    const picked = pick(file.name, await bytesOf(file))
    if (picked.kind === 'rejected') {
      set({ [slot]: null, problem: picked.message })
      return
    }
    set({ [slot]: picked.file, problem: null })
  }

const AFTER_INSTALL: Record<
  UpdateResult['kind'],
  (result: UpdateResult, set: Set, get: Get) => Promise<void>
> = {
  cancelled: () => {
    return Promise.resolve()
  },
  failed: (result, set, get) => {
    if (result.kind === 'failed') {
      set({
        view: {
          kind: 'failed',
          failure: firmwareFailure(
            result.code,
            result.detail,
            result.message,
            get().runningVersion
          ),
        },
      })
    }
    return Promise.resolve()
  },
  installed: async (_result, set, get) => {
    const total = get().bin?.bytes.byteLength ?? 0
    set({ view: runningView('restart', total, total) })
    const back = await waitForDash()
    set({ view: { kind: back ? 'success' : 'reconnect' } })
  },
}

const runInstall = async (set: Set, get: Get): Promise<void> => {
  const { bin, sig } = get()
  if (bin === null || sig === null || get().view.kind === 'running') return
  const total = bin.bytes.byteLength
  set({
    cancelRequested: false,
    runningVersion: useDeviceStore.getState().firmwareVersion ?? STRINGS.dash.unknownVersion,
    view: runningView('upload', 0, total),
  })
  const result = await installFirmware(
    { bytes: bin.bytes, signature: sig.bytes, version: bin.info.version },
    {
      onProgress: (sent) => set({ view: runningView('upload', sent, total) }),
      onCommitting: () => set({ view: runningView('signature', total, total) }),
      cancelled: () => get().cancelRequested,
    }
  )
  if (result.kind === 'cancelled') set({ view: { kind: 'choosing' } })
  await AFTER_INSTALL[result.kind](result, set, get)
}

export const useFirmwareStore = create<FirmwareState>()((set, get) => ({
  bin: null,
  sig: null,
  problem: null,
  view: { kind: 'choosing' },
  runningVersion: STRINGS.dash.unknownVersion,
  cancelRequested: false,
  chooseBin: choose('bin', pickedBin, set),
  chooseSig: choose('sig', pickedSig, set),
  askToInstall: () => {
    if (get().bin !== null && get().sig !== null) set({ view: { kind: 'confirming' } })
  },
  backToChoosing: () => set({ view: { kind: 'choosing' } }),
  install: () => runInstall(set, get),
  cancelUpload: () => set({ cancelRequested: true }),
  finish: () => set({ view: { kind: 'choosing' }, bin: null, sig: null, problem: null }),
}))
