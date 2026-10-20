import { describe, expect, it } from 'vitest'
import {
  chooseDashOrigin,
  chooseTransport,
  isLocalDevOrigin,
  type TransportEnv,
} from './transport-choice'

const env = (overrides: Partial<TransportEnv> = {}): TransportEnv => ({
  protocol: 'http:',
  host: '192.168.4.1',
  hostname: '192.168.4.1',
  search: '',
  devDashHost: undefined,
  hasWebSocket: true,
  hasWebSerial: false,
  ...overrides,
})

const localDev = (hostname: string, overrides: Partial<TransportEnv> = {}): TransportEnv =>
  env({ host: hostname, hostname, ...overrides })

describe('chooseTransport on a page the dash served', () => {
  it('talks WebSocket to the dash that served the page', () => {
    expect(chooseTransport(env())).toEqual({ kind: 'websocket', url: 'ws://192.168.4.1/ws' })
  })

  it('keeps the port of the serving host', () => {
    const choice = chooseTransport(env({ host: 'dash.local:8080', hostname: 'dash.local' }))
    expect(choice).toEqual({ kind: 'websocket', url: 'ws://dash.local:8080/ws' })
  })
})

describe('chooseTransport on a local dev origin', () => {
  it('falls back to Web Serial on a local dev origin with a serial-capable browser', () => {
    for (const name of ['localhost', '127.0.0.1']) {
      expect(chooseTransport(localDev(name, { hasWebSerial: true }))).toEqual({ kind: 'webserial' })
    }
  })

  it('has nothing to talk to on a local dev origin without Web Serial', () => {
    expect(chooseTransport(localDev('localhost'))).toEqual({ kind: 'none' })
  })

  it('points local dev at a dash or a mock through ?dash=', () => {
    const choice = chooseTransport(
      localDev('localhost', { search: '?dash=192.168.4.1', hasWebSerial: true })
    )
    expect(choice).toEqual({ kind: 'websocket', url: 'ws://192.168.4.1/ws' })
  })

  it('points local dev at a dash through the dev env variable', () => {
    const choice = chooseTransport(localDev('localhost', { devDashHost: 'localhost:8787' }))
    expect(choice).toEqual({ kind: 'websocket', url: 'ws://localhost:8787/ws' })
  })
})

describe('chooseTransport edge cases', () => {
  it('uses wss when the page itself is https', () => {
    const choice = chooseTransport(env({ protocol: 'https:' }))
    expect(choice).toEqual({ kind: 'websocket', url: 'wss://192.168.4.1/ws' })
  })

  it('uses Web Serial when a dash page has no WebSocket but the browser has serial', () => {
    expect(chooseTransport(env({ hasWebSocket: false, hasWebSerial: true }))).toEqual({
      kind: 'webserial',
    })
  })
})

describe('isLocalDevOrigin', () => {
  it('tells a local dev origin from a dash address', () => {
    expect(isLocalDevOrigin('localhost')).toBe(true)
    expect(isLocalDevOrigin('192.168.4.1')).toBe(false)
    expect(isLocalDevOrigin('canshift.local')).toBe(false)
  })
})

describe('chooseDashOrigin', () => {
  it('reads files from the dash that served the page', () => {
    expect(chooseDashOrigin(env())).toBe('http://192.168.4.1')
  })

  it('reads files from the dash or mock named by ?dash= in local dev', () => {
    expect(chooseDashOrigin(localDev('localhost', { search: '?dash=localhost:8787' }))).toBe(
      'http://localhost:8787'
    )
  })

  it('has no dash to read from on a bare local dev origin', () => {
    expect(chooseDashOrigin(localDev('localhost', { hasWebSerial: true }))).toBeNull()
  })
})
