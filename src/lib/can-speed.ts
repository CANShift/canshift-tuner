import { DeviceConfigSchema } from '@canshift/core'
import type { CanSpeedKbps } from '@canshift/core'

const CanSpeedKbpsSchema = DeviceConfigSchema.shape.canSpeedKbps

export const CAN_SPEED_OPTIONS = CanSpeedKbpsSchema.options.map((option) => ({
  value: String(option.value),
  label: `${String(option.value)} kbit/s`,
}))

export const parseCanSpeed = (value: string): CanSpeedKbps | null => {
  const parsed = CanSpeedKbpsSchema.safeParse(Number(value))
  return parsed.success ? parsed.data : null
}
