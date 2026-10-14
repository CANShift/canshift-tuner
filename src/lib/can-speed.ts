import { DEFAULT_DEVICE_CONFIG, DeviceConfigSchema } from '@canshift/core'
import type { CanSpeedKbps, DeviceConfig } from '@canshift/core'

const CanSpeedKbpsSchema = DeviceConfigSchema.shape.canSpeedKbps

export const CAN_SPEED_OPTIONS = CanSpeedKbpsSchema.options.map((option) => ({
  value: String(option.value),
  label: `${String(option.value)} kbit/s`,
}))

export type CanSpeedState =
  | { kind: 'offline' }
  | { kind: 'reading' }
  | { kind: 'ready'; config: DeviceConfig }
  | { kind: 'writing'; config: DeviceConfig }
  | { kind: 'written'; config: DeviceConfig }
  | { kind: 'error'; config: DeviceConfig; message: string }

const NOTES: Record<CanSpeedState['kind'], (state: CanSpeedState) => string> = {
  offline: () => 'Connect the dash to read and change its bus speed.',
  reading: () => 'Reading the bus speed from the dash…',
  ready: () => 'Must match the ECU. Writing it reboots the dash.',
  writing: () => 'Writing the bus speed — the dash reboots to apply it.',
  written: () => 'Bus speed saved — the dash is rebooting to apply it.',
  error: (state) => (state.kind === 'error' ? state.message : ''),
}

export const canSpeedNote = (state: CanSpeedState): string => NOTES[state.kind](state)

export const configOf = (state: CanSpeedState): DeviceConfig =>
  'config' in state ? state.config : DEFAULT_DEVICE_CONFIG

export const parseCanSpeed = (value: string): CanSpeedKbps | null => {
  const parsed = CanSpeedKbpsSchema.safeParse(Number(value))
  return parsed.success ? parsed.data : null
}
