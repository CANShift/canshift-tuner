import { create, type StoreApi } from 'zustand'
import { canScannerIpc, deviceEvents } from '../../transport'
import { useDeviceStore } from '../device.store'
import { useLogStore } from '../log.store'
import { createScanAccumulator, emptySnapshot } from './accumulator'
import type { CanScanSnapshot } from './accumulator'
import { transportErrorText } from '../../transport/humanize-transport-error'

const SNAPSHOT_INTERVAL_MS = 250

export type CanScanStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'error'

interface CanScanState {
  status: CanScanStatus
  error: string | null
  snapshot: CanScanSnapshot
  start: () => Promise<void>
  stop: () => Promise<void>
  reset: () => void
  startLearn: () => void
  stopLearn: () => void
  clearLearn: () => void
}

const accumulator = createScanAccumulator()
let unsubscribeFrames: (() => void) | null = null
let snapshotTimer: number | null = null
let generation = 0

const log = (level: 'info' | 'warn' | 'error', message: string) => {
  useLogStore.getState().push(level, message)
}

type SetScan = StoreApi<CanScanState>['setState']
type GetScan = StoreApi<CanScanState>['getState']

const BLOCKS_START: Record<CanScanStatus, boolean> = {
  idle: false,
  error: false,
  starting: true,
  running: true,
  stopping: true,
}

const BLOCKS_STOP: Record<CanScanStatus, boolean> = {
  idle: true,
  stopping: true,
  starting: false,
  running: false,
  error: false,
}

const deviceReady = (): boolean => {
  const { connected, simulationMode } = useDeviceStore.getState()
  return connected && !simulationMode
}

const stopSnapshotTimer = () => {
  if (snapshotTimer === null) return
  window.clearInterval(snapshotTimer)
  snapshotTimer = null
}

const startSnapshotTimer = (set: SetScan) => {
  stopSnapshotTimer()
  snapshotTimer = window.setInterval(() => {
    set({ snapshot: accumulator.snapshot(performance.now()) })
  }, SNAPSHOT_INTERVAL_MS)
}

const stopFrames = () => {
  unsubscribeFrames?.()
  unsubscribeFrames = null
}

const beginScan = (set: SetScan) => {
  accumulator.markStarted(performance.now())
  unsubscribeFrames = deviceEvents.onCanFrame((frame) => {
    accumulator.ingest(frame, performance.now())
  })
  startSnapshotTimer(set)
  set({ status: 'running' })
  log('info', 'CAN scan started')
}

const failStart = (set: SetScan, error: string | undefined) => {
  const err = transportErrorText(error)
  set({ status: 'error', error: err })
  log('error', `CAN scan start failed: ${err}`)
}

const startScan = (set: SetScan, get: GetScan) => async () => {
  if (!deviceReady() || BLOCKS_START[get().status]) return
  const gen = ++generation
  set({ status: 'starting', error: null })
  accumulator.reset()
  set({ snapshot: emptySnapshot() })

  const result = await canScannerIpc.start()
  if (generation !== gen) {
    if (result.success) void canScannerIpc.stop()
    return
  }
  if (!result.success) {
    failStart(set, result.error)
    return
  }
  beginScan(set)
}

const stopScan = (set: SetScan, get: GetScan) => async () => {
  if (BLOCKS_STOP[get().status]) return
  generation += 1
  set({ status: 'stopping' })
  stopSnapshotTimer()
  stopFrames()
  const result = await canScannerIpc.stop()
  if (!result.success) {
    log('warn', `CAN scan stop failed: ${transportErrorText(result.error)}`)
  }
  set({ status: 'idle', snapshot: accumulator.snapshot(performance.now()) })
  log('info', `CAN scan stopped — ${String(accumulator.totalFrames())} frames captured`)
}

const learnActions = (set: SetScan, get: GetScan) => {
  const refresh = () => {
    set({ snapshot: accumulator.snapshot(performance.now()) })
  }

  return {
    startLearn: () => {
      if (get().status !== 'running') return
      accumulator.startLearn()
      refresh()
    },

    stopLearn: () => {
      accumulator.stopLearn()
      refresh()
    },

    clearLearn: () => {
      accumulator.clearLearn()
      refresh()
    },
  }
}

export const useCanScanStore = create<CanScanState>()((set, get) => ({
  status: 'idle',
  error: null,
  snapshot: emptySnapshot(),
  start: startScan(set, get),
  stop: stopScan(set, get),

  reset: () => {
    accumulator.reset()
    if (get().status === 'running') accumulator.markStarted(performance.now())
    set({ snapshot: emptySnapshot() })
  },

  ...learnActions(set, get),
}))

useDeviceStore.subscribe((deviceState) => {
  if (deviceState.connected && !deviceState.simulationMode) return
  const { status, stop } = useCanScanStore.getState()
  if (status === 'running' || status === 'starting') void stop()
})
