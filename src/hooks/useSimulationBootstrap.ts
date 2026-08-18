import { useEffect } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useDashboardStore } from '../stores/dashboard.store'
import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'
import { adoptDemoProfile } from '../lib/demo-signals'
import { useSignalStore } from '../stores/signal.store'

export const useSimulationBootstrap = (): void => {
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const hasConfig = useDashboardStore((s) => s.config !== null)
  const setConfig = useDashboardStore((s) => s.setConfig)
  const applyProfile = useSignalStore((s) => s.applyProfile)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)

  useEffect(() => {
    if (!simulationMode || hasConfig) return
    const demo = adoptDemoProfile(selectedProfileKey)
    if (demo) applyProfile(demo.key, demo.signals)
    setConfig(structuredClone(DEFAULT_SIM_CONFIG))
  }, [simulationMode, hasConfig, setConfig, applyProfile, selectedProfileKey])
}
