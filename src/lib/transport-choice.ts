export type TransportChoice =
  { kind: 'websocket'; url: string } | { kind: 'webserial' } | { kind: 'none' }

export interface TransportEnv {
  protocol: string
  host: string
  hostname: string
  search: string
  devDashHost: string | undefined
  hasWebSocket: boolean
  hasWebSerial: boolean
}

const DASH_HOST_PARAM = 'dash'
const DASH_SOCKET_PATH = '/ws'

const LOCAL_DEV_NAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

export const isLocalDevOrigin = (hostname: string): boolean => LOCAL_DEV_NAMES.has(hostname)

const dashSocketUrl = (host: string, pageProtocol: string): string =>
  `${pageProtocol === 'https:' ? 'wss' : 'ws'}://${host}${DASH_SOCKET_PATH}`

const overrideHost = (env: TransportEnv): string | null => {
  const fromQuery = new URLSearchParams(env.search).get(DASH_HOST_PARAM)
  const host = fromQuery ?? env.devDashHost ?? ''
  return host.trim().length > 0 ? host.trim() : null
}

const servedByDashHost = (env: TransportEnv): string | null => {
  const override = overrideHost(env)
  if (override !== null) return override
  return isLocalDevOrigin(env.hostname) ? null : env.host
}

export const chooseTransport = (env: TransportEnv): TransportChoice => {
  const dashHost = servedByDashHost(env)
  if (dashHost !== null && env.hasWebSocket) {
    return { kind: 'websocket', url: dashSocketUrl(dashHost, env.protocol) }
  }
  if (env.hasWebSerial) return { kind: 'webserial' }
  return { kind: 'none' }
}

export const chooseDashOrigin = (env: TransportEnv): string | null => {
  const dashHost = servedByDashHost(env)
  return dashHost === null ? null : `${env.protocol}//${dashHost}`
}
