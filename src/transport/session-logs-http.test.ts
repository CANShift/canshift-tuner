import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteLogFile, fetchLogFile, fetchLogIndex } from './session-logs-http'

const ORIGIN = 'http://192.168.4.1'

const respond = (body: BodyInit | null, status = 200, type = 'application/json') => {
  const fetchMock = vi.fn(
    async () => new Response(body, { status, headers: { 'content-type': type } })
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const failNetwork = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new TypeError('network down')
    })
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchLogIndex', () => {
  it('lists the sessions on the card', async () => {
    const fetchMock = respond('{"card":true,"logs":[{"name":"S00001.csl","bytes":4096}]}')
    expect(await fetchLogIndex(ORIGIN)).toEqual({
      kind: 'listed',
      card: true,
      logs: [{ name: 'S00001.csl', bytes: 4096 }],
    })
    expect(fetchMock).toHaveBeenCalledWith(`${ORIGIN}/api/logs`, { cache: 'no-store' })
  })

  it('tells a dash without a card', async () => {
    respond('{"card":false,"logs":[]}')
    expect(await fetchLogIndex(ORIGIN)).toEqual({ kind: 'listed', card: false, logs: [] })
  })

  it('reads an older firmware that answers with the tuner page as not supported', async () => {
    respond('<!doctype html><title>CANShift</title>', 200, 'text/html')
    expect(await fetchLogIndex(ORIGIN)).toEqual({ kind: 'unsupported' })
  })

  it('reads a missing route as not supported', async () => {
    respond(null, 404)
    expect(await fetchLogIndex(ORIGIN)).toEqual({ kind: 'unsupported' })
  })

  it('reads a server error or a dead link as unreachable', async () => {
    respond(null, 500)
    expect(await fetchLogIndex(ORIGIN)).toEqual({ kind: 'unreachable' })
    failNetwork()
    expect(await fetchLogIndex(ORIGIN)).toEqual({ kind: 'unreachable' })
  })
})

describe('fetchLogFile', () => {
  it('returns the bytes of a session', async () => {
    respond(Uint8Array.from([0x43, 0x53, 0x4c, 0x47, 0x01]), 200, 'application/octet-stream')
    const file = await fetchLogFile(ORIGIN, 'S00001.csl')
    expect(file.kind).toBe('fetched')
    expect(file.kind === 'fetched' ? Array.from(file.bytes) : []).toEqual([
      0x43, 0x53, 0x4c, 0x47, 0x01,
    ])
  })

  it('tells a session that is gone from a dead link', async () => {
    respond(null, 404)
    expect(await fetchLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind: 'missing' })
    failNetwork()
    expect(await fetchLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind: 'unreachable' })
  })
})

describe('deleteLogFile', () => {
  it('deletes a session with a DELETE on its route', async () => {
    const fetchMock = respond(null, 204)
    expect(await deleteLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind: 'deleted' })
    expect(fetchMock).toHaveBeenCalledWith(`${ORIGIN}/api/logs/S00001.csl`, { method: 'DELETE' })
  })

  it('tells a session already gone from a refusal', async () => {
    respond(null, 404)
    expect(await deleteLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind: 'missing' })
    respond(null, 500)
    expect(await deleteLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind: 'unreachable' })
  })
})

describe('a dash that refuses the request', () => {
  it.each([
    [403, 'refused'],
    [409, 'notOwner'],
  ] as const)('reads %i as %s on every route', async (status, kind) => {
    respond(null, status)
    expect(await fetchLogIndex(ORIGIN)).toEqual({ kind })
    respond(null, status)
    expect(await fetchLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind })
    respond(null, status)
    expect(await deleteLogFile(ORIGIN, 'S00001.csl')).toEqual({ kind })
  })
})
