import { chooseTransport, type TransportChoice, type TransportEnv } from '../lib/transport-choice'
import { getSerialClient } from './webserial-client'
import { WebSocketClient } from './websocket-client'
import type { DeviceLink } from './device-link'

type PageLocation = Pick<TransportEnv, 'protocol' | 'host' | 'hostname' | 'search'>

const NO_PAGE: PageLocation = {
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  search: '',
}

const pageLocation = (): PageLocation => {
  if (typeof window === 'undefined') return NO_PAGE
  const { protocol, host, hostname, search } = window.location
  return { protocol, host, hostname, search }
}

const readTransportEnv = (): TransportEnv => ({
  ...pageLocation(),
  devDashHost: import.meta.env.VITE_DASH_HOST,
  hasWebSocket: typeof WebSocket !== 'undefined',
  hasWebSerial: typeof navigator !== 'undefined' && 'serial' in navigator,
})

let choice: TransportChoice | null = null
let link: DeviceLink | null = null

const transportChoice = (): TransportChoice => {
  choice ??= chooseTransport(readTransportEnv())
  return choice
}

const createLink = (selected: TransportChoice): DeviceLink =>
  selected.kind === 'websocket' ? new WebSocketClient(selected.url) : getSerialClient()

export const getDeviceLink = (): DeviceLink => {
  link ??= createLink(transportChoice())
  return link
}
