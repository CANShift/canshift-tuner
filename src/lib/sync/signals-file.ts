import { DEFAULT_DEVICE_CONFIG, SignalConfigSchema } from '@canshift/core'
import type { CanSpeedKbps } from '@canshift/core'
import type { CarSetup } from './setup'

const SIGNALS_FILE_VERSION = '1.0.0'
const SIGNALS_PROTOCOL = 'custom_v1.0'

export type SignalsFile = { kind: 'ok'; text: string } | { kind: 'invalid' }

export const signalsFile = (car: CarSetup, canSpeedKbps: CanSpeedKbps | undefined): SignalsFile => {
  const parsed = SignalConfigSchema.safeParse({
    version: SIGNALS_FILE_VERSION,
    protocol: SIGNALS_PROTOCOL,
    canSpeedKbps: canSpeedKbps ?? DEFAULT_DEVICE_CONFIG.canSpeedKbps,
    signals: car.signals,
  })
  return parsed.success ? { kind: 'ok', text: JSON.stringify(parsed.data) } : { kind: 'invalid' }
}
