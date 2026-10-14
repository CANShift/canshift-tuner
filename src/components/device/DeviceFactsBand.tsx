import { resolveScreenProfile } from '@canshift/core'
import { BoardBand } from './BoardBand'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore, type Transport } from '../../stores/device.store'
import { useSignalStore } from '../../stores/signal.store'
import { useResolvedBoardProfile } from '../../hooks/useResolvedBoardProfile'
import { CATALOGUE_INDEX } from '../../lib/ecu-catalogue'
import { summarizeConfig } from '../../lib/config-summary'
import { ecuLabelForKey } from '../../utils/ecu-label'

const TRANSPORT_LABELS: Record<Transport, string> = { usb: 'USB', wifi: 'Wi-Fi' }
const UNSET = '—'

const displayFact = (screen: { width: number; height: number }, driver: string | null): string => {
  const size = `${String(screen.width)} × ${String(screen.height)}`
  return driver === null ? size : `${driver.toUpperCase()} · ${size}`
}

export const DeviceFactsBand = () => {
  const config = useDashboardStore((s) => s.config)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const transport = useDeviceStore((s) => s.transport)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const panelDriver = useResolvedBoardProfile()?.profile.lcd.driver ?? null
  const screen = resolveScreenProfile(config?.targetProfile)
  const transportLabel = transport === null ? UNSET : TRANSPORT_LABELS[transport]

  return (
    <BoardBand
      facts={[
        { label: 'MODEL', value: screen.name },
        { label: 'DISPLAY', value: displayFact(screen, panelDriver) },
        { label: 'FIRMWARE', value: firmwareVersion ?? UNSET },
        { label: 'TRANSPORT', value: transportLabel },
        { label: 'ECU PROFILE', value: ecuLabelForKey(selectedProfileKey, CATALOGUE_INDEX) },
        { label: 'CONFIG', value: summarizeConfig(config) },
      ]}
    />
  )
}
