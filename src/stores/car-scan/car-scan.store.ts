import { create, type StoreApi } from 'zustand'
import { busScanIpc } from '../../transport'
import type { BusScanReport, BusScanResult } from '../../transport/bus-scan-wire'
import { useDeviceStore } from '../device.store'
import { useLogStore } from '../log.store'
import { carFingerprints } from '../../lib/car-scan/fingerprints'
import { matchCars, type CarMatch } from '../../lib/car-scan/match-cars'
import { errorMessage } from '../../lib/error-message'

export const POLL_INTERVAL_MS = 500
export const SCAN_DEADLINE_MS = 20_000

export type CarScanPhase = 'idle' | 'starting' | 'scanning' | 'matching' | 'done' | 'error'

export interface ScanProgress {
  listening: boolean
  kbps: number
  step: number
  steps: number
}

interface CarScanState {
  phase: CarScanPhase
  progress: ScanProgress | null
  result: BusScanResult | null
  matches: readonly CarMatch[]
  error: string | null
  start: () => Promise<void>
  reset: () => void
}

type SetScan = StoreApi<CarScanState>['setState']
type GetScan = StoreApi<CarScanState>['getState']

const BUSY: Record<CarScanPhase, boolean> = {
  idle: false,
  done: false,
  error: false,
  starting: true,
  scanning: true,
  matching: true,
}

const IDLE = { phase: 'idle', progress: null, result: null, matches: [], error: null } as const

let generation = 0
let pollTimer: ReturnType<typeof setTimeout> | null = null

const deviceReady = (): boolean => {
  const { connected, simulationMode } = useDeviceStore.getState()
  return connected && !simulationMode
}

const clearPoll = () => {
  if (pollTimer !== null) clearTimeout(pollTimer)
  pollTimer = null
}

const fail = (set: SetScan, error: string) => {
  clearPoll()
  generation += 1
  set({ phase: 'error', error, progress: null })
  useLogStore.getState().push('error', `Car scan failed: ${error}`)
}

const matchesFor = async (result: BusScanResult): Promise<CarMatch[]> => {
  if (result.outcome !== 'detected') return []
  const seen = new Set(result.frames.map((frame) => frame.id))
  return matchCars(seen, await carFingerprints())
}

const finish = async (set: SetScan, gen: number, result: BusScanResult) => {
  set({ phase: 'matching', progress: null, result })
  try {
    const matches = await matchesFor(result)
    if (gen !== generation) return
    set({ phase: 'done', matches })
    useLogStore
      .getState()
      .push('info', `Car scan: ${result.outcome}, ${String(result.kbps)} kbit/s`)
  } catch (err) {
    if (gen === generation) fail(set, errorMessage(err, 'catalogue_failed'))
  }
}

const progressOf = (report: Exclude<BusScanReport, { state: 'done' }>): ScanProgress | null =>
  report.state === 'idle'
    ? null
    : {
        listening: report.state === 'probing',
        kbps: report.kbps,
        step: report.step,
        steps: report.steps,
      }

const schedulePoll = (set: SetScan, gen: number, deadline: number) => {
  pollTimer = setTimeout(() => {
    void pollOnce(set, gen, deadline)
  }, POLL_INTERVAL_MS)
}

const pollOnce = async (set: SetScan, gen: number, deadline: number) => {
  pollTimer = null
  const polled = await busScanIpc.poll()
  if (gen !== generation) return
  if (polled.kind === 'error') return fail(set, polled.error)
  if (polled.report.state === 'done') return finish(set, gen, polled.report.result)
  if (Date.now() >= deadline) return fail(set, 'bus_scan_timeout')
  set({ progress: progressOf(polled.report) })
  schedulePoll(set, gen, deadline)
}

const startScan = (set: SetScan, get: GetScan) => async () => {
  if (!deviceReady() || BUSY[get().phase]) return
  const gen = ++generation
  set({ ...IDLE, phase: 'starting' })
  const started = await busScanIpc.start()
  if (gen !== generation) return
  if (!started.success) return fail(set, started.error ?? 'unknown_error')
  set({ phase: 'scanning' })
  schedulePoll(set, gen, Date.now() + SCAN_DEADLINE_MS)
}

export const useCarScanStore = create<CarScanState>()((set, get) => ({
  ...IDLE,
  matches: [],
  start: startScan(set, get),
  reset: () => {
    clearPoll()
    generation += 1
    set({ ...IDLE, matches: [] })
  },
}))

useDeviceStore.subscribe((device) => {
  if (device.connected && !device.simulationMode) return
  if (BUSY[useCarScanStore.getState().phase]) fail(useCarScanStore.setState, 'disconnected')
})
