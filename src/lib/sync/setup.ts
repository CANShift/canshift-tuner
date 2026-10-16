import type { DashboardConfig, DeviceConfig } from '@canshift/core'

export interface DeviceSettings {
  deviceConfig: DeviceConfig | null
  brightness: number | null
}

export interface DashSetup {
  dashboard: DashboardConfig | null
  settings: DeviceSettings
}

export const UNKNOWN_SETTINGS: DeviceSettings = { deviceConfig: null, brightness: null }

export const EMPTY_SETUP: DashSetup = { dashboard: null, settings: UNKNOWN_SETTINGS }
