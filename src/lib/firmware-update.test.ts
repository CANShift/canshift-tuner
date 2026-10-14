import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installFirmware, OTA_CHUNK_BYTES } from './firmware-update'
import { otaIpc } from '../transport/ota-ipc'

vi.mock('../transport/ota-ipc', () => ({
  otaIpc: { begin: vi.fn(), write: vi.fn(), commit: vi.fn(), abort: vi.fn() },
}))

const OK = { ok: true }
const IMAGE = new Uint8Array(OTA_CHUNK_BYTES * 2 + 100).fill(7)
const SIGNATURE = new Uint8Array(64).fill(0xff)
const VERSION = '0.21.0'
const FIRMWARE = { bytes: IMAGE, signature: SIGNATURE, version: VERSION }
const install = () => installFirmware(FIRMWARE, () => undefined)

beforeEach(() => {
  vi.mocked(otaIpc.begin).mockReset().mockResolvedValue(OK)
  vi.mocked(otaIpc.write).mockReset().mockResolvedValue(OK)
  vi.mocked(otaIpc.commit).mockReset().mockResolvedValue(OK)
  vi.mocked(otaIpc.abort).mockReset().mockResolvedValue(OK)
})

describe('installFirmware', () => {
  it('declares the size, SHA-256, signature and version, streams ordered chunks, then commits', async () => {
    const progress: number[] = []
    const result = await installFirmware(FIRMWARE, (sent) => progress.push(sent))
    expect(result).toEqual({ kind: 'installed' })
    const [total, sha, sig, version] = vi.mocked(otaIpc.begin).mock.calls[0] ?? []
    expect(total).toBe(IMAGE.byteLength)
    expect(sha).toMatch(/^[0-9a-f]{64}$/)
    expect(sig).toBe(btoa(String.fromCharCode(...SIGNATURE)))
    expect(version).toBe(VERSION)
    expect(vi.mocked(otaIpc.write).mock.calls.map(([offset]) => offset)).toEqual([0, 512, 1024])
    expect(progress).toEqual([512, 1024, IMAGE.byteLength])
    expect(otaIpc.commit).toHaveBeenCalledTimes(1)
  })
})

describe('installFirmware refused while streaming', () => {
  it('stops at a refused begin with a human message', async () => {
    vi.mocked(otaIpc.begin).mockResolvedValue({ ok: false, error: 'size_out_of_range' })
    const result = await install()
    expect(result).toEqual({ kind: 'failed', message: expect.stringMatching(/does not fit/) })
    expect(otaIpc.write).not.toHaveBeenCalled()
  })

  it('aborts the slot when a chunk is refused', async () => {
    vi.mocked(otaIpc.write)
      .mockResolvedValueOnce(OK)
      .mockResolvedValueOnce({ ok: false, error: 'offset_mismatch' })
    const result = await install()
    expect(result.kind).toBe('failed')
    expect(otaIpc.abort).toHaveBeenCalledTimes(1)
    expect(otaIpc.commit).not.toHaveBeenCalled()
  })
})

describe('installFirmware refused for its signature or checksum', () => {
  it('reports the dash refusing an unsigned image before any write', async () => {
    vi.mocked(otaIpc.begin).mockResolvedValue({ ok: false, error: 'ota_unsigned' })
    const result = await install()
    expect(result).toEqual({ kind: 'failed', message: expect.stringMatching(/unsigned/) })
    expect(otaIpc.write).not.toHaveBeenCalled()
  })

  it('reports the dash refusing a signature that does not verify', async () => {
    vi.mocked(otaIpc.commit).mockResolvedValue({ ok: false, error: 'ota_bad_signature' })
    const result = await install()
    expect(result).toEqual({ kind: 'failed', message: expect.stringMatching(/signature/) })
  })

  it('reports the dash refusing the finished image', async () => {
    vi.mocked(otaIpc.commit).mockResolvedValue({
      ok: false,
      error: 'sha256_mismatch',
      data: { detail: '0x0' },
    })
    const result = await install()
    expect(result).toEqual({ kind: 'failed', message: expect.stringMatching(/checksum/) })
  })
})
