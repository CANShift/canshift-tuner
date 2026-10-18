import type { DashboardConfig, DeviceConfig } from '@canshift/core'
import type { Refusal } from './refusal'
import { failureForCode } from './send-codes'
import type { DashSetup, ScreenRotation } from './setup'
import { sameValue } from './setup-path'
import { signalsFile } from './signals-file'

export type WriteResult = { ok: true } | { ok: false; code: string }

export interface DashWriter {
  writeDashboard: (config: DashboardConfig) => Promise<WriteResult>
  writeBrightness: (brightness: number) => Promise<WriteResult>
  writeDeviceConfig: (config: DeviceConfig) => Promise<WriteResult>
  writeSignals: (file: string) => Promise<WriteResult>
  writeDayMode: (day: boolean) => Promise<WriteResult>
  writeRotation: (rotation: ScreenRotation, brightness: number) => Promise<WriteResult>
}

export type RestartReason = 'canSpeed' | 'car' | 'rotation'

export type SendResult =
  | { kind: 'sent'; confirmed: DashSetup; restart: RestartReason | null; more: boolean }
  | { kind: 'refused'; confirmed: DashSetup; reasons: Refusal[] }
  | { kind: 'dropped'; confirmed: DashSetup }

interface SendStep {
  write: (writer: DashWriter) => Promise<WriteResult>
  confirm: (confirmed: DashSetup) => DashSetup
  restarts: RestartReason | null
}

const dashboardStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const config = snapshot.dashboard
  if (config === null || sameValue(config, device.dashboard)) return []
  return [
    {
      write: (writer) => writer.writeDashboard(config),
      confirm: (confirmed) => ({ ...confirmed, dashboard: config }),
      restarts: null,
    },
  ]
}

const brightnessStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const brightness = snapshot.settings.brightness
  if (brightness === null || brightness === device.settings.brightness) return []
  return [
    {
      write: (writer) => writer.writeBrightness(brightness),
      confirm: (confirmed) => ({ ...confirmed, settings: { ...confirmed.settings, brightness } }),
      restarts: null,
    },
  ]
}

const dayModeStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const dayMode = snapshot.settings.dayMode
  if (dayMode === null || dayMode === device.settings.dayMode) return []
  return [
    {
      write: (writer) => writer.writeDayMode(dayMode),
      confirm: (confirmed) => ({ ...confirmed, settings: { ...confirmed.settings, dayMode } }),
      restarts: null,
    },
  ]
}

const DEFAULT_BRIGHTNESS = 80

const rotationStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const rotation = snapshot.settings.rotation
  if (rotation === null || rotation === device.settings.rotation) return []
  const brightness =
    snapshot.settings.brightness ?? device.settings.brightness ?? DEFAULT_BRIGHTNESS
  return [
    {
      write: (writer) => writer.writeRotation(rotation, brightness),
      confirm: (confirmed) => ({ ...confirmed, settings: { ...confirmed.settings, rotation } }),
      restarts: 'rotation',
    },
  ]
}

const deviceConfigStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const deviceConfig = snapshot.settings.deviceConfig
  if (deviceConfig === null || sameValue(deviceConfig, device.settings.deviceConfig)) return []
  return [
    {
      write: (writer) => writer.writeDeviceConfig(deviceConfig),
      confirm: (confirmed) => ({ ...confirmed, settings: { ...confirmed.settings, deviceConfig } }),
      restarts: 'canSpeed',
    },
  ]
}

const INVALID_SIGNALS: WriteResult = { ok: false, code: 'invalid_signals' }

const carStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const car = snapshot.car
  if (car === null || sameValue(car, device.car)) return []
  const file = signalsFile(car, snapshot.settings.deviceConfig?.canSpeedKbps)
  return [
    {
      write: (writer) =>
        file.kind === 'ok' ? writer.writeSignals(file.text) : Promise.resolve(INVALID_SIGNALS),
      confirm: (confirmed) => ({ ...confirmed, car }),
      restarts: 'car',
    },
  ]
}

const allSteps = (snapshot: DashSetup, device: DashSetup): SendStep[] => [
  ...dashboardStep(snapshot, device),
  ...brightnessStep(snapshot, device),
  ...dayModeStep(snapshot, device),
  ...deviceConfigStep(snapshot, device),
  ...carStep(snapshot, device),
  ...rotationStep(snapshot, device),
]

const sendSteps = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const steps = allSteps(snapshot, device)
  const live = steps.filter((step) => step.restarts === null)
  const firstRestart = steps.find((step) => step.restarts !== null)
  return firstRestart === undefined ? live : [...live, firstRestart]
}

const lastRestart = (steps: readonly SendStep[]): RestartReason | null =>
  steps.reduce<RestartReason | null>((reason, step) => step.restarts ?? reason, null)

const failed = (confirmed: DashSetup, code: string): SendResult => {
  const failure = failureForCode(code)
  return failure.kind === 'dropped'
    ? { kind: 'dropped', confirmed }
    : { kind: 'refused', confirmed, reasons: failure.reasons }
}

export const sendSetup = async (
  snapshot: DashSetup,
  device: DashSetup,
  writer: DashWriter
): Promise<SendResult> => {
  const steps = sendSteps(snapshot, device)
  const more = allSteps(snapshot, device).length > steps.length
  let confirmed = device
  for (const step of steps) {
    const result = await step.write(writer)
    if (!result.ok) return failed(confirmed, result.code)
    confirmed = step.confirm(confirmed)
  }
  return { kind: 'sent', confirmed, restart: lastRestart(steps), more }
}
