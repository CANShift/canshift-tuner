import { beforeEach, describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { DEFAULT_SIM_SIGNALS } from '../../config/default-sim-signals'
import { diffSetup } from '../../lib/sync/diff-setup'
import type { DashWriter, WriteResult } from '../../lib/sync/send-setup'
import { UNKNOWN_SETTINGS } from '../../lib/sync/setup'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../dashboard.store'
import { withDefaultTheme } from '../dashboard/lifecycle.slice'
import { useSignalStore } from '../signal.store'
import { useToastStore } from '../toast.store'
import { readDraft, undoAllChanges } from './draft'
import { sendToDash } from './send-actions'
import { useSyncStore } from './sync.store'

const OK: WriteResult = { ok: true }
const baseline = withDefaultTheme(DEFAULT_SIM_CONFIG)

const writer = (writeDashboard: DashWriter['writeDashboard']): DashWriter => ({
  writeDashboard,
  writeBrightness: () => Promise.resolve(OK),
  writeDeviceConfig: () => Promise.resolve(OK),
})

const editSpeedLimit = (value: number): void => {
  const config = useDashboardStore.getState().config
  if (!config) return
  useDashboardStore.getState().replaceConfig(
    produce(config, (c) => {
      const speed = c.pages[0]?.widgets[0]?.config as { dangerLevel?: number } | undefined
      if (speed) speed.dangerLevel = value
    }),
    'edit'
  )
}

const TEMPLATE = DEFAULT_SIM_SIGNALS[0]

const signalsForEveryGauge = () =>
  DEFAULT_SIM_CONFIG.pages
    .flatMap((page) => page.widgets.map((widget) => widget.signal))
    .filter((name) => name !== '')
    .flatMap((name) => (TEMPLATE ? [{ ...TEMPLATE, name }] : []))

const unsent = () => diffSetup(useSyncStore.getState().device, readDraft())

beforeEach(() => {
  useSignalStore.setState({ signals: signalsForEveryGauge() })
  useDashboardStore.getState().setConfig(baseline)
  useSyncStore.setState({
    device: { dashboard: baseline, settings: UNKNOWN_SETTINGS },
    settingsDraft: UNKNOWN_SETTINGS,
    sendState: 'idle',
    refusals: [],
  })
})

describe('sendToDash', () => {
  it('leaves nothing unsent and says so once the dash confirms', async () => {
    editSpeedLimit(250)
    await sendToDash(writer(() => Promise.resolve(OK)))
    expect(unsent()).toEqual([])
    expect(useToastStore.getState().toast?.message).toBe(STRINGS.send.sent)
  })

  it('keeps an edit made while the send was running as unsent', async () => {
    editSpeedLimit(250)
    await sendToDash(
      writer(() => {
        editSpeedLimit(200)
        return Promise.resolve(OK)
      })
    )
    expect(unsent().map((change) => change.was)).toEqual(['Was 250'])
  })
})

describe('sendToDash failing', () => {
  it('keeps every change when the Wi-Fi drops mid-send', async () => {
    editSpeedLimit(250)
    await sendToDash(writer(() => Promise.resolve({ ok: false, code: 'connection_closed' })))
    expect(useSyncStore.getState().sendState).toBe('failed')
    expect(unsent()).toHaveLength(1)
  })

  it('refuses before sending when a gauge reads a signal the car lacks', async () => {
    useSignalStore.setState({ signals: [] })
    editSpeedLimit(250)
    await sendToDash(writer(() => Promise.reject(new Error('must not be called'))))
    expect(useSyncStore.getState().sendState).toBe('refused')
    expect(useSyncStore.getState().refusals.length).toBeGreaterThan(0)
  })
})

describe('undoAllChanges', () => {
  it('brings the draft back to what the dash has', () => {
    editSpeedLimit(250)
    undoAllChanges()
    expect(unsent()).toEqual([])
  })
})
