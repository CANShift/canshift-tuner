import { describe, it, expect, beforeEach, vi } from 'vitest'

import { flashFirmwareOta, OtaError } from './ota'
import { NotAnAppImageError } from './image'
import { getSerialClient } from '../../transport/webserial-client'
import { CMD_OTA_END } from '../../transport/opcodes'

vi.mock('../../transport/webserial-client', () => ({
  getSerialClient: vi.fn(),
}))

const sendMock = vi.fn()

const APP_DESC_MAGIC = 0xabcd5432
const APP_DESC_OFFSET = 0x20

const appImage = (): Uint8Array => {
  const bytes = new Uint8Array(512)
  bytes[0] = 0xe9
  new DataView(bytes.buffer).setUint32(APP_DESC_OFFSET, APP_DESC_MAGIC, true)
  return bytes
}

const flash = (bytes: Uint8Array, onLog: (line: string) => void = () => undefined): Promise<void> =>
  flashFirmwareOta({ bytes, onProgress: () => undefined, onLog })

beforeEach(() => {
  sendMock.mockReset()
  sendMock.mockResolvedValue({ ok: true })
  vi.mocked(getSerialClient).mockReturnValue({ send: sendMock } as unknown as ReturnType<
    typeof getSerialClient
  >)
})

describe('flashFirmwareOta image gate', () => {
  it('refuses a merged image without sending a single byte to the board', async () => {
    const merged = new Uint8Array(4096).fill(0xff)

    await expect(flash(merged)).rejects.toBeInstanceOf(NotAnAppImageError)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('refuses a bootloader image before OTA_BEGIN', async () => {
    const bootloader = new Uint8Array(512)
    bootloader[0] = 0xe9

    await expect(flash(bootloader)).rejects.toThrow(/app descriptor/)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('transfers an app-only image', async () => {
    await flash(appImage())

    expect(sendMock).toHaveBeenCalled()
  })
})

describe('flashFirmwareOta rejections', () => {
  it('throws a humanised commit failure and logs the raw slug for diagnosis', async () => {
    const lines: string[] = []
    sendMock.mockImplementation((cmd: number) =>
      cmd === CMD_OTA_END
        ? Promise.resolve({ ok: false, error: 'ota_end_failed', data: { detail: '0x1503' } })
        : Promise.resolve({ ok: true })
    )

    const caught = await flash(appImage(), (line) => lines.push(line)).catch((err: unknown) => err)

    expect(caught).toBeInstanceOf(OtaError)
    expect((caught as OtaError).message).toMatch(/not a valid ESP32 app/)
    expect((caught as OtaError).message).not.toMatch(/ota_end_failed/)
    expect(lines.some((line) => line.includes('ota_end_failed') && line.includes('0x1503'))).toBe(
      true
    )
  })

  it('humanises a begin rejection', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'no_ota_partition' })

    await expect(flash(appImage())).rejects.toThrow(/BOOT-button flasher/)
  })
})
