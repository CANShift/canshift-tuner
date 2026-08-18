import { useEffect } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useDashboardStore } from '../stores/dashboard.store'
import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'

export const useSimulationBootstrap = (): void => {
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const hasConfig = useDashboardStore((s) => s.config !== null)
  const setConfig = useDashboardStore((s) => s.setConfig)

  useEffect(() => {
    if (simulationMode && !hasConfig) {
      setConfig(structuredClone(DEFAULT_SIM_CONFIG))
    }
  }, [simulationMode, hasConfig, setConfig])
}
