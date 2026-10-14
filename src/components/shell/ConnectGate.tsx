import type { ReactNode } from 'react'
import { ConnectPanel } from './ConnectPanel'
import { useConnectionStore } from '../../stores/connection.store'
import { useDeviceStore } from '../../stores/device.store'
import { humanizeTransportError } from '../../transport/humanize-transport-error'

type ConnectionStatus = ReturnType<typeof useConnectionStore.getState>['status']

const CONNECT_LABEL: Record<ConnectionStatus, string> = {
  connected: 'Connect',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  disconnected: 'Connect',
}

export interface ConnectGateProps {
  children: ReactNode
}

export const ConnectGate = ({ children }: ConnectGateProps) => {
  const status = useConnectionStore((s) => s.status)
  const lastError = useConnectionStore((s) => s.lastError)
  const connect = useConnectionStore((s) => s.connect)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const enterSimulation = useDeviceStore((s) => s.enterSimulation)

  const live = status === 'connected' || status === 'reconnecting'
  if (live || simulationMode) return <>{children}</>

  return (
    <ConnectPanel
      busy={status === 'connecting'}
      connectLabel={CONNECT_LABEL[status]}
      error={lastError === null ? null : humanizeTransportError(lastError)}
      onConnect={() => {
        void connect()
      }}
      onEditOffline={enterSimulation}
    />
  )
}
