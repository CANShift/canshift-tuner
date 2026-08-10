import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReleaseAsset } from '@canshift/core'
import { downloadFirmwareAsset, firmwareAssetProxyUrl } from './download'
import { computeSha256Hex } from './hash'
import { FIRMWARE_MAX_BYTES } from './local-firmware'

const DOWNLOAD_URL =
  'https://github.com/CANShift/canshift-firmware/releases/download/v1.2.3/canshift-crowpanel_28-v1.2.3-merged.bin'

const IMAGE = new Uint8Array([0xe9, 0x01, 0x02, 0x03])

const assetWith = (overrides: Partial<ReleaseAsset> = {}): ReleaseAsset => ({
  name: 'canshift-crowpanel_28-v1.2.3-merged.bin',
  downloadUrl: DOWNLOAD_URL,
  sizeBytes: IMAGE.byteLength,
  ...overrides,
})

const streamOf = (chunks: Uint8Array[], signal: AbortSignal, close: boolean): ReadableStream =>
  new ReadableStream<Uint8Array>({
    start: (controller) => {
      for (const chunk of chunks) controller.enqueue(chunk)
      if (close) {
        controller.close()
        return
      }
      signal.addEventListener('abort', () => {
        controller.error(new DOMException('Aborted', 'AbortError'))
      })
    },
  })

const mockFetch = (chunks: Uint8Array[], close = true): void => {
  vi.stubGlobal('fetch', (_url: string, init?: { signal?: AbortSignal }) => {
    const signal = init?.signal ?? new AbortController().signal
    return Promise.resolve(new Response(streamOf(chunks, signal, close), { status: 200 }))
  })
}

describe('firmwareAssetProxyUrl', () => {
  it('maps a release URL onto the proxy', () => {
    expect(firmwareAssetProxyUrl(DOWNLOAD_URL)).toBe(
      '/api/firmware-download?tag=v1.2.3&asset=canshift-crowpanel_28-v1.2.3-merged.bin'
    )
  })

  it('rejects a URL that is not shaped like a release asset', () => {
    expect(() => firmwareAssetProxyUrl('https://github.com/CANShift')).toThrow(/Unrecognised/)
  })
})

describe('downloadFirmwareAsset', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('returns the image when the published digest matches', async () => {
    const sha256 = await computeSha256Hex(IMAGE)
    mockFetch([IMAGE])
    const firmware = await downloadFirmwareAsset(assetWith({ digest: `sha256:${sha256}` }))
    expect(firmware.sha256).toBe(sha256)
    expect(firmware.size).toBe(IMAGE.byteLength)
  })

  it('reports progress against the announced size', async () => {
    const sha256 = await computeSha256Hex(IMAGE)
    mockFetch([IMAGE.slice(0, 2), IMAGE.slice(2)])
    const seen: [number, number][] = []
    await downloadFirmwareAsset(assetWith({ digest: sha256 }), (loaded, total) => {
      seen.push([loaded, total])
    })
    expect(seen).toEqual([
      [2, 4],
      [4, 4],
    ])
  })

  it('rejects an asset published without a digest', async () => {
    mockFetch([IMAGE])
    await expect(downloadFirmwareAsset(assetWith())).rejects.toThrow(/No checksum published/)
  })

  it('rejects an asset whose digest is not a sha256 hex string', async () => {
    mockFetch([IMAGE])
    await expect(downloadFirmwareAsset(assetWith({ digest: 'sha256:nope' }))).rejects.toThrow(
      /Unusable checksum/
    )
  })

  it('rejects an image whose bytes do not match the digest', async () => {
    const wrong = await computeSha256Hex(new Uint8Array([0xe9, 0xff]))
    mockFetch([IMAGE])
    await expect(downloadFirmwareAsset(assetWith({ digest: wrong }))).rejects.toThrow(
      /Checksum mismatch/
    )
  })

  it('aborts a stream that outgrows the size cap regardless of the announced size', async () => {
    const megabyte = new Uint8Array(1024 * 1024)
    megabyte[0] = 0xe9
    const chunks = Array.from({ length: FIRMWARE_MAX_BYTES / megabyte.byteLength + 1 }, () =>
      megabyte.slice()
    )
    mockFetch(chunks)
    await expect(
      downloadFirmwareAsset(assetWith({ digest: 'sha256:' + 'a'.repeat(64) }))
    ).rejects.toThrow(/Download exceeded/)
  })

  it('aborts a body that stalls mid-transfer', async () => {
    vi.useFakeTimers()
    mockFetch([IMAGE.slice(0, 2)], false)
    const pending = downloadFirmwareAsset(assetWith({ digest: 'sha256:' + 'a'.repeat(64) }))
    const assertion = expect(pending).rejects.toThrow(/stalled/)
    await vi.advanceTimersByTimeAsync(20_000)
    await assertion
  })

  it('does not accept an empty body', async () => {
    mockFetch([])
    await expect(
      downloadFirmwareAsset(assetWith({ digest: 'sha256:' + 'a'.repeat(64) }))
    ).rejects.toThrow(/Downloaded firmware is empty/)
  })
})
