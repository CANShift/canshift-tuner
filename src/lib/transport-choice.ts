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

export const DASH_HOST_PARAM = 'dash'
export const DASH_SOCKET_PATH = '/ws'

const HOSTED_NAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'canshift.app'])
const HOSTED_SUFFIXES = ['.canshift.app', '.workers.dev']

export const isHostedOrigin = (hostname: string): boolean =>
  HOSTED_NAMES.has(hostname) || HOSTED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))

export const dashSocketUrl = (host: string, pageProtocol: string): string =>
  `${pageProtocol === 'https:' ? 'wss' : 'ws'}://${host}${DASH_SOCKET_PATH}`

const overrideHost = (env: TransportEnv): string | null => {
  const fromQuery = new URLSearchParams(env.search).get(DASH_HOST_PARAM)
  const host = fromQuery ?? env.devDashHost ?? ''
  return host.trim().length > 0 ? host.trim() : null
}

const servedByDashHost = (env: TransportEnv): string | null => {
  const override = overrideHost(env)
  if (override !== null) return override
  return isHostedOrigin(env.hostname) ? null : env.host
}

export const chooseTransport = (env: TransportEnv): TransportChoice => {
  const dashHost = servedByDashHost(env)
  if (dashHost !== null && env.hasWebSocket) {
    return { kind: 'websocket', url: dashSocketUrl(dashHost, env.protocol) }
  }
  if (env.hasWebSerial) return { kind: 'webserial' }
  return { kind: 'none' }
}
