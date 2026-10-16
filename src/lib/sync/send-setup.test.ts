import { describe, expect, it, vi } from 'vitest'
import { produce } from 'immer'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { STRINGS } from '../../strings'
import { SEND_CODE_OUTCOMES, failureForCode } from './send-codes'
import { sendSetup, type DashWriter, type WriteResult } from './send-setup'
import type { DashSetup } from './setup'

const device: DashSetup = {
  dashboard: DEFAULT_SIM_CONFIG,
  settings: { deviceConfig: { canSpeedKbps: 500 }, brightness: 80 },
}

const edited: DashSetup = {
  dashboard: produce(DEFAULT_SIM_CONFIG, (c) => {
    c.pages.pop()
  }),
  settings: { deviceConfig: { canSpeedKbps: 250 }, brightness: 40 },
}

const OK: WriteResult = { ok: true }

const writer = (overrides: Partial<DashWriter> = {}): DashWriter => ({
  writeDashboard: vi.fn(() => Promise.resolve(OK)),
  writeBrightness: vi.fn(() => Promise.resolve(OK)),
  writeDeviceConfig: vi.fn(() => Promise.resolve(OK)),
  ...overrides,
})

describe('sendSetup', () => {
  it('writes only what differs from the dash', async () => {
    const dash = writer()
    const draft: DashSetup = { ...device, settings: { ...device.settings, brightness: 40 } }
    const result = await sendSetup(draft, device, dash)
    expect(dash.writeDashboard).not.toHaveBeenCalled()
    expect(dash.writeBrightness).toHaveBeenCalledWith(40)
    expect(result).toMatchObject({ kind: 'sent', restarting: false })
  })

  it('confirms the snapshot it sent, not what the editor holds now', async () => {
    const result = await sendSetup(edited, device, writer())
    expect(result.confirmed).toEqual(edited)
    expect(result).toMatchObject({ kind: 'sent', restarting: true })
  })
})

describe('sendSetup failing', () => {
  it('keeps the parts that landed when a later write is dropped', async () => {
    const dash = writer({
      writeBrightness: () => Promise.resolve({ ok: false, code: 'ack_timeout' }),
    })
    const result = await sendSetup(edited, device, dash)
    expect(result.kind).toBe('dropped')
    expect(result.confirmed.dashboard).toBe(edited.dashboard)
    expect(result.confirmed.settings).toEqual(device.settings)
    expect(dash.writeDeviceConfig).not.toHaveBeenCalled()
  })

  it('turns a dash refusal into a plain reason', async () => {
    const dash = writer({
      writeDashboard: () => Promise.resolve({ ok: false, code: 'write_failed' }),
    })
    const result = await sendSetup(edited, device, dash)
    expect(result).toMatchObject({
      kind: 'refused',
      confirmed: device,
      reasons: [{ text: STRINGS.refused.outOfSpace }],
    })
  })
})

const FIRMWARE_ERROR_CODES = [
  'b64_decode',
  'bad_args',
  'blob_too_large',
  'busy',
  'config_not_found',
  'line_too_long',
  'missing_device_config',
  'missing_payload',
  'no_memory',
  'oom',
  'open_failed',
  'out_of_sequence',
  'parse_error',
  'read_failed',
  'status_too_long',
  'too_large',
  'unknown_command',
  'write_failed',
]

describe('failureForCode', () => {
  it('knows every error the firmware sends while saving', () => {
    expect(FIRMWARE_ERROR_CODES.filter((code) => !(code in SEND_CODE_OUTCOMES))).toEqual([])
  })

  it('falls back to a plain sentence for a code it has never seen', () => {
    expect(failureForCode('E_SOMETHING_NEW')).toEqual({
      kind: 'refused',
      reasons: [{ where: 'Dash', text: STRINGS.refused.fallback, target: null }],
    })
  })

  it('reads a lost link as a drop, not a refusal', () => {
    expect(failureForCode('CONNECTION_CLOSED')).toEqual({ kind: 'dropped' })
  })
})
