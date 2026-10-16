import { describe, it, expect, beforeEach } from 'vitest'
import { HEAP_STATS_RING_CAP, useDeviceStore } from './device.store'
const connectAndPopulate = (): void => {
  const s = useDeviceStore.getState()
  s.setConnected('usb')
  s.setFirmwareVersion('1.2.3')
  s.setFirmwareCompat({ kind: 'mismatch', expected: 2, got: 1, version: '1.2.3' })
  s.setFirmwareLiveness({ kind: 'alive', lastPongAt: 1, uptimeMs: 100 })
  s.pushHeapStats({
    tsMs: 1,
    freeInternal: 1000,
    largestInternal: 500,
    freePsram: null,
    largestPsram: null,
  })
  s.setIsDayMode(true)
}

describe('device.store setDisconnected (#1704)', () => {
  beforeEach(() => {
    connectAndPopulate()
  })

  it('resets everything that must not survive a reconnect', () => {
    useDeviceStore.getState().setDisconnected()
    const s = useDeviceStore.getState()
    expect(s.status).toBe('disconnected')
    expect(s.connected).toBe(false)
    expect(s.transport).toBeNull()
    expect(s.firmwareVersion).toBeNull()
    expect(s.firmwareCompat).toEqual({ kind: 'unknown' })
    expect(s.firmwareLiveness).toEqual({ kind: 'unknown' })
    expect(s.heapStats).toEqual([])
    expect(s.isDayMode).toBeNull()
    expect(s.errorMessage).toBeNull()
  })

  it('surfaces a transport error when one is passed', () => {
    useDeviceStore.getState().setDisconnected('port_gone')
    const s = useDeviceStore.getState()
    expect(s.status).toBe('error')
    expect(s.errorMessage).toBe('port_gone')
    expect(s.connected).toBe(false)
    expect(s.firmwareVersion).toBeNull()
  })
})

describe('device store heap samples', () => {
  it('keeps only the newest heap samples', () => {
    const store = useDeviceStore.getState()
    store.clearHeapStats()
    const sample = {
      tsMs: 0,
      freeInternal: 1,
      largestInternal: 1,
      freePsram: null,
      largestPsram: null,
    }
    for (let i = 0; i < HEAP_STATS_RING_CAP + 5; i++) store.pushHeapStats({ ...sample, tsMs: i })
    const stats = useDeviceStore.getState().heapStats
    expect(stats).toHaveLength(HEAP_STATS_RING_CAP)
    expect(stats[0]?.tsMs).toBe(5)
  })
})

describe('device store status', () => {
  it('reports burning while syncing, then falls back to the link state', () => {
    const store = useDeviceStore.getState()
    store.setConnected('usb')
    store.setSyncing(true)
    expect(useDeviceStore.getState().status).toBe('burning')
    store.setSyncing(false)
    expect(useDeviceStore.getState().status).toBe('connected')
    store.setDisconnected()
    store.setSyncing(false)
    expect(useDeviceStore.getState().status).toBe('disconnected')
  })

  it('clears an error back to the link state', () => {
    const store = useDeviceStore.getState()
    store.setConnected('wifi')
    store.setError('boom')
    store.clearError()
    expect(useDeviceStore.getState()).toMatchObject({ status: 'connected', errorMessage: null })
  })
})
