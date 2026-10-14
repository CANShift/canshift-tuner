import { useDeviceStore } from '../stores/device.store'
import type { Transport } from '../stores/device.store'

export const useLiveTransport = (): Transport | null => {
  const connected = useDeviceStore((s) => s.connected)
  const transport = useDeviceStore((s) => s.transport)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  return connected && !simulationMode ? transport : null
}
