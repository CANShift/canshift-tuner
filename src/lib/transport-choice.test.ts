import { describe, expect, it } from 'vitest'
import { chooseTransport, isHostedOrigin, type TransportEnv } from './transport-choice'

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

const hosted = (hostname: string, overrides: Partial<TransportEnv> = {}): TransportEnv =>
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

describe('chooseTransport on a hosted origin', () => {
  it('falls back to Web Serial on a hosted origin with a serial-capable browser', () => {
    for (const name of [
      'localhost',
      '127.0.0.1',
      'canshift.app',
      'pr-12.canshift-tuner.workers.dev',
    ]) {
      expect(chooseTransport(hosted(name, { hasWebSerial: true }))).toEqual({ kind: 'webserial' })
    }
  })

  it('has nothing to talk to on a hosted origin without Web Serial', () => {
    expect(chooseTransport(hosted('canshift.app'))).toEqual({ kind: 'none' })
  })

  it('points local dev at a dash or a mock through ?dash=', () => {
    const choice = chooseTransport(
      hosted('localhost', { search: '?dash=192.168.4.1', hasWebSerial: true })
    )
    expect(choice).toEqual({ kind: 'websocket', url: 'ws://192.168.4.1/ws' })
  })

  it('points local dev at a dash through the dev env variable', () => {
    const choice = chooseTransport(hosted('localhost', { devDashHost: 'localhost:8787' }))
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

describe('isHostedOrigin', () => {
  it('tells hosted origins from a dash address', () => {
    expect(isHostedOrigin('canshift.app')).toBe(true)
    expect(isHostedOrigin('192.168.4.1')).toBe(false)
    expect(isHostedOrigin('canshift.local')).toBe(false)
  })
})
