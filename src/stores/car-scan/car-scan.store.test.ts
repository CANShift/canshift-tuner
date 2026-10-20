import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BusScanPoll } from '../../transport/bus-scan-ipc'
import type { BusScanResult } from '../../transport/bus-scan-wire'

const startMock = vi.fn()
const pollMock = vi.fn()

vi.mock('../../transport', () => ({
  busScanIpc: {
    start: (): Promise<{ success: boolean; error?: string }> => startMock(),
    poll: (): Promise<BusScanPoll> => pollMock(),
  },
}))

import { POLL_INTERVAL_MS, SCAN_DEADLINE_MS, useCarScanStore } from './car-scan.store'
import { useDeviceStore } from '../device.store'

const MAXXECU_IDS = [0x370, 0x371, 0x372, 0x373, 0x374, 0x375]

const result = (overrides: Partial<BusScanResult> = {}): BusScanResult => ({
  outcome: 'detected',
  kbps: 500,
  probes: [],
  frames: MAXXECU_IDS.map((id) => ({ id, count: 150, rateHz: 50 })),
  truncated: false,
  ...overrides,
})

const probing: BusScanPoll = {
  kind: 'ok',
  report: { state: 'probing', kbps: 250, step: 2, steps: 5 },
}

const done = (overrides: Partial<BusScanResult> = {}): BusScanPoll => ({
  kind: 'ok',
  report: { state: 'done', result: result(overrides) },
})

const settle = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms)
}

const waitForPhase = (phase: string) =>
  vi.waitFor(() => {
    expect(useCarScanStore.getState().phase).toBe(phase)
  })

beforeEach(() => {
  vi.useFakeTimers()
  startMock.mockReset().mockResolvedValue({ success: true })
  pollMock.mockReset()
  useDeviceStore.setState({ connected: true, simulationMode: false })
  useCarScanStore.getState().reset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('car scan store happy path', () => {
  it('walks the scan to a matched car', async () => {
    pollMock.mockResolvedValueOnce(probing).mockResolvedValueOnce(done())
    await useCarScanStore.getState().start()
    expect(useCarScanStore.getState().phase).toBe('scanning')
    await settle(POLL_INTERVAL_MS)
    expect(useCarScanStore.getState().progress).toEqual({
      listening: true,
      kbps: 250,
      step: 2,
      steps: 5,
    })
    await settle(POLL_INTERVAL_MS)
    await waitForPhase('done')
    const { matches, result: scanned } = useCarScanStore.getState()
    expect(scanned?.kbps).toBe(500)
    expect(matches[0]?.confidence).toBe('strong')
  })

  it('suggests no car when the bus was silent', async () => {
    pollMock.mockResolvedValueOnce(done({ outcome: 'silent', kbps: 0, frames: [] }))
    await useCarScanStore.getState().start()
    await settle(POLL_INTERVAL_MS)
    await waitForPhase('done')
    expect(useCarScanStore.getState().matches).toEqual([])
  })
})

describe('car scan store failures', () => {
  it('reports a refused start', async () => {
    startMock.mockResolvedValue({ success: false, error: 'bus_scan_busy' })
    await useCarScanStore.getState().start()
    expect(useCarScanStore.getState()).toMatchObject({ phase: 'error', error: 'bus_scan_busy' })
  })

  it('reports a failed poll and stops polling', async () => {
    pollMock.mockResolvedValue({ kind: 'error', error: 'ack_timeout' })
    await useCarScanStore.getState().start()
    await settle(POLL_INTERVAL_MS * 3)
    expect(useCarScanStore.getState().error).toBe('ack_timeout')
    expect(pollMock).toHaveBeenCalledTimes(1)
  })

  it('gives up on a scan that never finishes', async () => {
    pollMock.mockResolvedValue(probing)
    await useCarScanStore.getState().start()
    await settle(SCAN_DEADLINE_MS + POLL_INTERVAL_MS)
    expect(useCarScanStore.getState().error).toBe('bus_scan_timeout')
  })

  it('fails the scan when the dash disconnects', async () => {
    pollMock.mockResolvedValue(probing)
    await useCarScanStore.getState().start()
    useDeviceStore.setState({ connected: false })
    expect(useCarScanStore.getState().error).toBe('disconnected')
    await settle(POLL_INTERVAL_MS * 2)
    expect(pollMock).not.toHaveBeenCalled()
  })
})

describe('car scan store guards', () => {
  it('does nothing without a real dash', async () => {
    useDeviceStore.setState({ connected: true, simulationMode: true })
    await useCarScanStore.getState().start()
    expect(startMock).not.toHaveBeenCalled()
    expect(useCarScanStore.getState().phase).toBe('idle')
  })

  it('ignores a second start while scanning', async () => {
    pollMock.mockResolvedValue(probing)
    await useCarScanStore.getState().start()
    await useCarScanStore.getState().start()
    expect(startMock).toHaveBeenCalledTimes(1)
  })

  it('drops a reply that lands after a reset', async () => {
    pollMock.mockResolvedValue(done())
    await useCarScanStore.getState().start()
    useCarScanStore.getState().reset()
    await settle(POLL_INTERVAL_MS * 2)
    expect(useCarScanStore.getState().phase).toBe('idle')
  })
})
