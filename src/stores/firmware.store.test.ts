import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installFirmware, type InstallHooks } from '../lib/firmware-update'
import { waitForDash } from '../lib/wait-for-dash'
import { STRINGS } from '../strings'
import { useFirmwareStore } from './firmware.store'

vi.mock('../lib/firmware-update', () => ({ installFirmware: vi.fn() }))
vi.mock('../lib/wait-for-dash', () => ({ waitForDash: vi.fn() }))

const BIN = {
  name: 'fw.bin',
  bytes: new Uint8Array(1024),
  info: { version: '0.21.0', projectName: 'canshift' },
}
const SIG = { name: 'fw.sig', bytes: new Uint8Array(64) }

beforeEach(() => {
  vi.mocked(installFirmware).mockReset().mockResolvedValue({ kind: 'installed' })
  vi.mocked(waitForDash).mockReset().mockResolvedValue(true)
  useFirmwareStore.setState({ bin: BIN, sig: SIG, problem: null, view: { kind: 'choosing' } })
})

describe('the firmware update', () => {
  it('asks before installing, and only with both files', () => {
    useFirmwareStore.setState({ sig: null })
    useFirmwareStore.getState().askToInstall()
    expect(useFirmwareStore.getState().view.kind).toBe('choosing')
    useFirmwareStore.setState({ sig: SIG })
    useFirmwareStore.getState().askToInstall()
    expect(useFirmwareStore.getState().view.kind).toBe('confirming')
  })

  it('waits for the dash to come back before it says updated', async () => {
    await useFirmwareStore.getState().install()
    expect(waitForDash).toHaveBeenCalledTimes(1)
    expect(useFirmwareStore.getState().view.kind).toBe('success')
  })

  it('tells the user to reconnect by hand when the dash does not come back', async () => {
    vi.mocked(waitForDash).mockResolvedValue(false)
    await useFirmwareStore.getState().install()
    expect(useFirmwareStore.getState().view.kind).toBe('reconnect')
  })
})

describe('the firmware update guarding itself', () => {
  it('never starts a second install while one runs', async () => {
    let release: () => void = () => undefined
    vi.mocked(installFirmware).mockImplementation(
      () => new Promise((resolve) => (release = () => resolve({ kind: 'installed' })))
    )
    const first = useFirmwareStore.getState().install()
    await useFirmwareStore.getState().install()
    release()
    await first
    expect(installFirmware).toHaveBeenCalledTimes(1)
  })
})

describe('the firmware update stopping', () => {
  it('stops the upload when asked', async () => {
    vi.mocked(installFirmware).mockImplementation((_firmware, hooks: InstallHooks) => {
      useFirmwareStore.getState().cancelUpload()
      return Promise.resolve(
        hooks.cancelled?.() === true ? { kind: 'cancelled' } : { kind: 'installed' }
      )
    })
    await useFirmwareStore.getState().install()
    expect(useFirmwareStore.getState().view.kind).toBe('choosing')
  })

  it('says the old version still runs after a refusal', async () => {
    vi.mocked(installFirmware).mockResolvedValue({
      kind: 'failed',
      message: 'x',
      code: 'connection_closed',
      detail: undefined,
    })
    await useFirmwareStore.getState().install()
    expect(useFirmwareStore.getState().view).toMatchObject({
      kind: 'failed',
      failure: { cause: STRINGS.firmware.wifiDropped },
    })
  })
})
