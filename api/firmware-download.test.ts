import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from './firmware-download'

const MEGABYTE = 1024 * 1024
const MAX_ASSET_BYTES = 16 * MEGABYTE

let ipCounter = 0

const request = (query: string): Request => {
  ipCounter += 1
  return new Request(`https://tuner.canshift.app/api/firmware-download?${query}`, {
    headers: { 'x-forwarded-for': `10.0.0.${String(ipCounter)}` },
  })
}

const upstream = (body: BodyInit, headers: HeadersInit = {}): void => {
  vi.stubGlobal('fetch', () => Promise.resolve(new Response(body, { status: 200, headers })))
}

const streamOfMegabytes = (count: number): ReadableStream<Uint8Array> => {
  let sent = 0
  return new ReadableStream<Uint8Array>({
    pull: (controller) => {
      if (sent >= count) {
        controller.close()
        return
      }
      sent += 1
      controller.enqueue(new Uint8Array(MEGABYTE))
    },
  })
}

describe('firmware-download proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('serves a .bin asset as an octet stream', async () => {
    upstream(new Uint8Array([0xe9, 0x01]))
    const res = await handler(request('tag=v1.2.3&asset=canshift-crowpanel_28-v1.2.3-merged.bin'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/octet-stream')
  })

  it('serves manifest.json instead of rejecting it as a bad asset', async () => {
    upstream('{"schema":1}')
    const res = await handler(request('tag=v1.2.3&asset=manifest.json'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json')
    await expect(res.text()).resolves.toBe('{"schema":1}')
  })

  it('rejects an asset extension that is neither .bin nor .json', async () => {
    upstream('nope')
    const res = await handler(request('tag=v1.2.3&asset=firmware.elf'))
    expect(res.status).toBe(400)
    await expect(res.text()).resolves.toBe('bad_asset')
  })

  it('rejects a traversal attempt in the tag', async () => {
    upstream('nope')
    const res = await handler(request('tag=1.0.0-..&asset=merged.bin'))
    expect(res.status).toBe(400)
    await expect(res.text()).resolves.toBe('bad_tag')
  })

  it('refuses an upstream that announces more than the cap', async () => {
    upstream(new Uint8Array([0]), { 'content-length': String(MAX_ASSET_BYTES + 1) })
    const res = await handler(request('tag=v1.2.3&asset=merged.bin'))
    expect(res.status).toBe(502)
    await expect(res.text()).resolves.toBe('asset_too_large')
  })

  it('errors the stream when an upstream without content-length outgrows the cap', async () => {
    upstream(streamOfMegabytes(MAX_ASSET_BYTES / MEGABYTE + 1))
    const res = await handler(request('tag=v1.2.3&asset=merged.bin'))
    expect(res.status).toBe(200)
    await expect(res.arrayBuffer()).rejects.toThrow()
  })
})
