import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const startMock = vi.fn()
const stopMock = vi.fn()

vi.mock('../../transport', () => ({
  canScannerIpc: {
    start: (): Promise<{ success: boolean; error?: string }> => startMock(),
    stop: (): Promise<{ success: boolean; error?: string }> => stopMock(),
  },
  deviceEvents: {
    onCanFrame: () => () => undefined,
  },
}))

import { useCanScanStore } from './can-scan.store'
import { useDeviceStore } from '../device.store'

const connectDevice = () => {
  useDeviceStore.setState({ connected: true, simulationMode: false })
}

beforeEach(() => {
  startMock.mockReset()
  stopMock.mockReset()
  stopMock.mockResolvedValue({ success: true })
  useCanScanStore.setState({ status: 'idle', error: null })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('can-scan store start race', () => {
  it('abandons a start whose IPC resolves after a stop began, and stops the device scan', async () => {
    connectDevice()
    let resolveStart: (r: { success: boolean }) => void = () => undefined
    startMock.mockReturnValue(
      new Promise((resolve) => {
        resolveStart = resolve
      })
    )

    const starting = useCanScanStore.getState().start()
    expect(useCanScanStore.getState().status).toBe('starting')

    const stopping = useCanScanStore.getState().stop()
    resolveStart({ success: true })
    await Promise.all([starting, stopping])

    expect(useCanScanStore.getState().status).toBe('idle')
    expect(stopMock.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})

describe('can-scan store stop race', () => {
  it('refuses to start while a stop is in flight', async () => {
    connectDevice()
    useCanScanStore.setState({ status: 'stopping' })

    await useCanScanStore.getState().start()

    expect(startMock).not.toHaveBeenCalled()
    expect(useCanScanStore.getState().status).toBe('stopping')
  })

  it('surfaces the start error in state', async () => {
    connectDevice()
    startMock.mockResolvedValue({ success: false, error: 'port_busy' })

    await useCanScanStore.getState().start()

    expect(useCanScanStore.getState().status).toBe('error')
    expect(useCanScanStore.getState().error).toBe('port_busy')
  })
})

describe('can-scan store lifecycle', () => {
  it('runs a scan and returns to idle on stop', async () => {
    vi.stubGlobal('window', { setInterval: () => 1, clearInterval: () => undefined })
    connectDevice()
    startMock.mockResolvedValue({ success: true })

    await useCanScanStore.getState().start()
    expect(useCanScanStore.getState().status).toBe('running')

    await useCanScanStore.getState().stop()
    expect(useCanScanStore.getState().status).toBe('idle')
    expect(stopMock).toHaveBeenCalledTimes(1)
  })

  it('does not start without a real device', async () => {
    useDeviceStore.setState({ connected: true, simulationMode: true })
    await useCanScanStore.getState().start()
    expect(startMock).not.toHaveBeenCalled()
  })

  it('ignores a stop while idle', async () => {
    await useCanScanStore.getState().stop()
    expect(stopMock).not.toHaveBeenCalled()
  })
})

describe('can-scan store learn window', () => {
  it('only opens the learn window while running', () => {
    useCanScanStore.getState().startLearn()
    expect(useCanScanStore.getState().snapshot.learn).toBeNull()
  })
})
