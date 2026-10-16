import type { DashboardConfig, DeviceConfig, SignalDef } from '@canshift/core'

export interface DeviceSettings {
  deviceConfig: DeviceConfig | null
  brightness: number | null
}

export interface CarSetup {
  profileKey: string
  signals: SignalDef[]
}

export interface DashSetup {
  dashboard: DashboardConfig | null
  settings: DeviceSettings
  car: CarSetup | null
}

export const UNKNOWN_SETTINGS: DeviceSettings = { deviceConfig: null, brightness: null }

export const EMPTY_SETUP: DashSetup = { dashboard: null, settings: UNKNOWN_SETTINGS, car: null }
