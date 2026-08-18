import { useLocation } from 'react-router-dom'
import { ECU_PROFILES, resolveScreenProfile } from '@canshift/core'
import { FooterView } from './FooterView'
import { useConnectionStore } from '../../stores/connection.store'
import { useDeviceStore } from '../../stores/device.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useSignalStore } from '../../stores/signal.store'
import { useUiStore } from '../../stores/ui.store'

const CUSTOM_PROFILE = 'CUSTOM PROFILE'

const profileLabel = (key: string): string => {
  const builtinId = key.startsWith('builtin:') ? key.slice('builtin:'.length) : null
  if (builtinId === null) return CUSTOM_PROFILE
  return ECU_PROFILES.find((p) => p.id === builtinId)?.name ?? CUSTOM_PROFILE
}

export const Footer = () => {
  const status = useConnectionStore((s) => s.status)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const cliOpen = useUiStore((s) => s.cliOpen)
  const toggleCli = useUiStore((s) => s.toggleCli)
  const location = useLocation()

  const connected = status === 'connected' || status === 'reconnecting' || simulationMode

  return (
    <FooterView
      cliHandle={location.pathname === '/dash'}
      cliOpen={cliOpen}
      onToggleCli={toggleCli}
      connected={connected}
      boardLabel={resolveScreenProfile(targetProfile).name}
      ecuLabel={profileLabel(selectedProfileKey)}
      firmwareLabel={firmwareVersion !== null ? `fw ${firmwareVersion}` : 'fw —'}
    />
  )
}
