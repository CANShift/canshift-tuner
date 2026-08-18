import type { SignalDef } from '@canshift/core'
import { SignalDefSchema } from '@canshift/core'
import simSignalsJson from './default-sim-signals.json'

export const DEFAULT_SIM_PROFILE_KEY = 'demo:canshift'

export const DEFAULT_SIM_SIGNALS: SignalDef[] = simSignalsJson.map(
  (signal) => SignalDefSchema.parse(signal) as SignalDef
)
