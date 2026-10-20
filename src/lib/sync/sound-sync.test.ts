import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { diffSetup } from './diff-setup'
import { revertChange } from './revert'
import { sendSetup, type DashWriter, type WriteResult } from './send-setup'
import type { DashSetup } from './setup'

const OK: WriteResult = { ok: true }
const SOUND = { volume: 70, boot: true, shiftTone: false }

const device: DashSetup = {
  dashboard: DEFAULT_SIM_CONFIG,
  settings: { deviceConfig: null, brightness: 80, rotation: null, dayMode: null, sound: SOUND },
  car: null,
}

const withSound = (sound: DashSetup['settings']['sound']): DashSetup => ({
  ...device,
  settings: { ...device.settings, sound },
})

const writer = (): DashWriter => ({
  writeDashboard: vi.fn(() => Promise.resolve(OK)),
  writeBrightness: vi.fn(() => Promise.resolve(OK)),
  writeDeviceConfig: vi.fn(() => Promise.resolve(OK)),
  writeSignals: vi.fn(() => Promise.resolve(OK)),
  writeDayMode: vi.fn(() => Promise.resolve(OK)),
  writeRotation: vi.fn(() => Promise.resolve(OK)),
  writeSound: vi.fn(() => Promise.resolve(OK)),
})

describe('sound settings in the change list', () => {
  it('lists each changed sound setting with what the dash had', () => {
    const draft = withSound({ volume: 20, boot: false, shiftTone: true })
    expect(diffSetup(device, draft).map((c) => [c.what, c.was])).toEqual([
      ['Sound volume 20%', 'Was 70%'],
      ['Start-up sound off', 'Was on'],
      ['Shift tone on', 'Was off'],
    ])
  })

  it('undoes one sound setting', () => {
    const draft = withSound({ ...SOUND, shiftTone: true })
    const [change] = diffSetup(device, draft)
    if (!change) throw new Error('expected a change')
    expect(revertChange(draft, device, change).settings.sound).toEqual(SOUND)
  })
})

describe('sound settings in the send', () => {
  it('sends the sound live, keeping the brightness the dash has', async () => {
    const dash = writer()
    const sound = { ...SOUND, volume: 30 }
    const result = await sendSetup(withSound(sound), device, dash)
    expect(dash.writeSound).toHaveBeenCalledWith(sound, 80)
    expect(dash.writeBrightness).not.toHaveBeenCalled()
    expect(result).toMatchObject({ kind: 'sent', restart: null, more: false })
    expect(result.confirmed.settings.sound).toEqual(sound)
  })

  it('writes nothing when the sound is unchanged or the board has none', async () => {
    const dash = writer()
    await sendSetup(device, device, dash)
    await sendSetup(withSound(null), withSound(null), dash)
    expect(dash.writeSound).not.toHaveBeenCalled()
  })
})
