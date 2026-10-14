import type { ReactNode } from 'react'
import { ConnectPanel } from './ConnectPanel'
import { useConnectionStore } from '../../stores/connection.store'
import { useDeviceStore } from '../../stores/device.store'
import { humanizeTransportError } from '../../transport/humanize-transport-error'
import { transportChoice } from '../../transport/link'
import type { TransportChoice } from '../../lib/transport-choice'

type ConnectionStatus = ReturnType<typeof useConnectionStore.getState>['status']

interface LinkCopy {
  title: string
  body: string
  canConnect: boolean
}

const LINK_COPY: Record<TransportChoice['kind'], LinkCopy> = {
  websocket: {
    title: 'Connecting to the dash',
    body: 'The tuner talks to the dash that served this page, over its Wi-Fi. If it does not connect, check this device is still on the dash’s network.',
    canConnect: true,
  },
  webserial: {
    title: 'Connect the dash',
    body: 'Plug the dash into this computer over USB-C, press Connect and pick its port.',
    canConnect: true,
  },
  none: {
    title: 'Open the tuner from the dash',
    body: 'On the dash, open Settings → Workshop mode, join the Wi-Fi network it shows, then open the address on its screen. A desktop Chrome or Edge can also connect over USB.',
    canConnect: false,
  },
}

const INSTALLED_TITLE = 'Firmware installed'

const gateCopy = (notice: string | null): LinkCopy =>
  notice === null
    ? LINK_COPY[transportChoice().kind]
    : { title: INSTALLED_TITLE, body: notice, canConnect: true }

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
  const notice = useConnectionStore((s) => s.notice)
  const connect = useConnectionStore((s) => s.connect)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const enterSimulation = useDeviceStore((s) => s.enterSimulation)

  const live = status === 'connected' || status === 'reconnecting'
  if (live || simulationMode) return <>{children}</>

  const copy = gateCopy(notice)
  return (
    <ConnectPanel
      title={copy.title}
      body={copy.body}
      busy={status === 'connecting'}
      connectLabel={CONNECT_LABEL[status]}
      error={lastError === null ? null : humanizeTransportError(lastError)}
      onConnect={copy.canConnect ? () => void connect() : null}
      onEditOffline={enterSimulation}
    />
  )
}
