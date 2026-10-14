import { beforeEach, describe, expect, it, vi } from 'vitest'

const readMock = vi.fn()
const clearMock = vi.fn()

vi.mock('../transport/dtc-ipc', () => ({
  dtcIpc: {
    read: (): Promise<unknown> => readMock(),
    clear: (): Promise<unknown> => clearMock(),
  },
}))

import { useDtcStore } from './dtc.store'
import { useDeviceStore } from './device.store'

beforeEach(() => {
  readMock.mockReset()
  clearMock.mockReset()
  useDtcStore.setState({ codes: ['P0001'], hasRead: false, status: 'idle', error: null })
  useDeviceStore.setState({ simulationMode: false })
})

describe('dtc store device read', () => {
  it('stores the codes the device returns', async () => {
    readMock.mockResolvedValue({ ok: true, codes: ['P0171'] })
    await useDtcStore.getState().read()
    expect(useDtcStore.getState()).toMatchObject({
      codes: ['P0171'],
      hasRead: true,
      status: 'idle',
      error: null,
    })
  })

  it('keeps the previous codes and reports the error when the read fails', async () => {
    readMock.mockResolvedValue({ ok: false, codes: [] })
    await useDtcStore.getState().read()
    expect(useDtcStore.getState()).toMatchObject({
      codes: ['P0001'],
      hasRead: false,
      status: 'idle',
      error: 'read_failed',
    })
  })
})

describe('dtc store device clear', () => {
  it('re-reads the codes after a successful clear', async () => {
    clearMock.mockResolvedValue({ ok: true })
    readMock.mockResolvedValue({ ok: true, codes: [] })
    await useDtcStore.getState().clear()
    expect(useDtcStore.getState()).toMatchObject({
      codes: [],
      hasRead: true,
      status: 'idle',
      error: null,
    })
  })
})

describe('dtc store device clear failures', () => {
  it('reports a failed clear without reading again', async () => {
    clearMock.mockResolvedValue({ ok: false, error: 'ack_timeout' })
    await useDtcStore.getState().clear()
    expect(readMock).not.toHaveBeenCalled()
    expect(useDtcStore.getState()).toMatchObject({
      codes: ['P0001'],
      status: 'idle',
      error: 'ack_timeout',
    })
  })

  it('empties the list and reports the error when the re-read fails', async () => {
    clearMock.mockResolvedValue({ ok: true })
    readMock.mockResolvedValue({ ok: false, codes: [], error: 'invalid_dtc_response' })
    await useDtcStore.getState().clear()
    expect(useDtcStore.getState()).toMatchObject({
      codes: [],
      hasRead: true,
      status: 'idle',
      error: 'invalid_dtc_response',
    })
  })
})
