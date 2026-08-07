import { beforeEach, describe, it, expect } from 'vitest'
import { SIMULATED_DTCS, useDtcStore } from './dtc.store'
import { useDeviceStore } from './device.store'

describe('dtc store (simulation)', () => {
  beforeEach(() => {
    useDtcStore.setState({ codes: [], hasRead: false, status: 'idle', error: null })
    useDeviceStore.setState({ simulationMode: true })
  })

  it('read() fills the simulated codes and marks hasRead', async () => {
    await useDtcStore.getState().read()
    const state = useDtcStore.getState()
    expect(state.codes).toEqual(SIMULATED_DTCS)
    expect(state.hasRead).toBe(true)
    expect(state.status).toBe('idle')
    expect(state.error).toBeNull()
  })

  it('clear() empties the list', async () => {
    await useDtcStore.getState().read()
    await useDtcStore.getState().clear()
    const state = useDtcStore.getState()
    expect(state.codes).toEqual([])
    expect(state.hasRead).toBe(true)
    expect(state.status).toBe('idle')
  })
})
