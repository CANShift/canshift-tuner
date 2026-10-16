import type { ReactNode } from 'react'
import { useConnection } from '../../hooks/useConnection'
import { useConnectionStore } from '../../stores/connection.store'
import { useDeviceStore } from '../../stores/device.store'
import { NotConnectedScreen } from './NotConnectedScreen'

export interface ConnectionGateProps {
  children: ReactNode
}

export const ConnectionGate = ({ children }: ConnectionGateProps) => {
  const { connection, anotherDevice, editingOffline } = useConnection()
  const connect = useConnectionStore((s) => s.connect)
  const keepEditing = useDeviceStore((s) => s.enterSimulation)
  if (connection !== 'offline' || editingOffline) return <>{children}</>
  return (
    <NotConnectedScreen
      anotherDevice={anotherDevice}
      onTryAgain={() => {
        void connect()
      }}
      onKeepEditing={keepEditing}
    />
  )
}
