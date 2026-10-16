import type { DashboardConfig, DeviceConfig } from '@canshift/core'
import type { Refusal } from './refusal'
import { failureForCode } from './send-codes'
import type { DashSetup } from './setup'
import { sameValue } from './setup-path'

export type WriteResult = { ok: true } | { ok: false; code: string }

export interface DashWriter {
  writeDashboard: (config: DashboardConfig) => Promise<WriteResult>
  writeBrightness: (brightness: number) => Promise<WriteResult>
  writeDeviceConfig: (config: DeviceConfig) => Promise<WriteResult>
}

export type SendResult =
  | { kind: 'sent'; confirmed: DashSetup; restarting: boolean }
  | { kind: 'refused'; confirmed: DashSetup; reasons: Refusal[] }
  | { kind: 'dropped'; confirmed: DashSetup }

interface SendStep {
  write: (writer: DashWriter) => Promise<WriteResult>
  confirm: (confirmed: DashSetup) => DashSetup
  restarts: boolean
}

const dashboardStep = (snapshot: DashSetup, device: DashSetup): SendStep[] => {
  const config = snapshot.dashboard
  if (config === null || sameValue(config, device.dashboard)) return []
  return [
    {
      write: (writer) => writer.writeDashboard(config),
      confirm: (confirmed) => ({ ...confirmed, dashboard: config }),
      restarts: false,
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
      restarts: false,
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
      restarts: true,
    },
  ]
}

export const sendSteps = (snapshot: DashSetup, device: DashSetup): SendStep[] => [
  ...dashboardStep(snapshot, device),
  ...brightnessStep(snapshot, device),
  ...deviceConfigStep(snapshot, device),
]

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
  let confirmed = device
  for (const step of steps) {
    const result = await step.write(writer)
    if (!result.ok) return failed(confirmed, result.code)
    confirmed = step.confirm(confirmed)
  }
  return { kind: 'sent', confirmed, restarting: steps.some((step) => step.restarts) }
}
