import type { SignalDef } from '@canshift/core'
import { DEFAULT_SIM_PROFILE_KEY, DEFAULT_SIM_SIGNALS } from '../config/default-sim-signals'
import { DEFAULT_PROFILE_KEY } from '../stores/signal.store'

export interface DemoProfileAdoption {
  key: string
  signals: SignalDef[]
}

export const adoptDemoProfile = (currentKey: string): DemoProfileAdoption | null => {
  if (currentKey !== DEFAULT_PROFILE_KEY && currentKey !== DEFAULT_SIM_PROFILE_KEY) return null
  return { key: DEFAULT_SIM_PROFILE_KEY, signals: structuredClone(DEFAULT_SIM_SIGNALS) }
}
