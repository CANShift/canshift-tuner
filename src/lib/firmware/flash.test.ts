import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assertChipMatchesBoard,
  flashFileArray,
  FlashError,
  handshakeFailureMessage,
} from './flash'

const esptoolStubs = vi.hoisted(() => ({
  disconnect: vi.fn(() => Promise.resolve()),
  main: vi.fn(() => Promise.resolve()),
  writeFlash: vi.fn(() => Promise.resolve()),
  softReset: vi.fn(() => Promise.resolve()),
  chipName: 'ESP32',
}))

vi.mock('esptool-js', () => ({
  Transport: class {
    disconnect = esptoolStubs.disconnect
  },
  ESPLoader: class {
    connect = vi.fn()
    main = esptoolStubs.main
    writeFlash = esptoolStubs.writeFlash
    softReset = esptoolStubs.softReset
    get chip() {
      return { CHIP_NAME: esptoolStubs.chipName }
    }
  },
}))

describe('assertChipMatchesBoard', () => {
  it('throws on a cross-architecture mismatch even when the detected chip is itself supported', () => {
    expect(() => assertChipMatchesBoard('esp32s3', 'ESP32')).toThrow(FlashError)
  })

  it('throws when the selected board family differs from the detected chip', () => {
    expect(() => assertChipMatchesBoard('esp32', 'ESP32-S3')).toThrow(FlashError)
  })

  it('passes when the families match, case- and separator-insensitively', () => {
    expect(() => assertChipMatchesBoard('esp32', 'ESP32')).not.toThrow()
    expect(() => assertChipMatchesBoard('esp32-s3', 'ESP32-S3')).not.toThrow()
  })

  it('passes when no board chip is known (old release / no manifest)', () => {
    expect(() => assertChipMatchesBoard(undefined, 'ESP32-S3')).not.toThrow()
  })
})

describe('flashFileArray', () => {
  const merged = new Uint8Array([1, 2, 3])
  const nvs = new Uint8Array([4, 5, 6])

  it('writes only the merged image when there is nothing to provision', () => {
    expect(flashFileArray(merged)).toEqual([{ data: merged, address: 0x0 }])
  })

  it('writes the NVS image after the merged one, so its erased padding cannot win', () => {
    const files = flashFileArray(merged, nvs)

    expect(files).toEqual([
      { data: merged, address: 0x0 },
      { data: nvs, address: 0x9000 },
    ])
  })
})

describe('handshakeFailureMessage', () => {
  it('says nothing about the pre-reset when it ran', () => {
    const msg = handshakeFailureMessage('timed out')
    expect(msg).toContain('timed out')
    expect(msg).not.toContain('pre-reset')
  })

  it('threads the pre-reset failure in, so the handshake error names the real cause', () => {
    const msg = handshakeFailureMessage('timed out', 'this port cannot toggle DTR/RTS')
    expect(msg).toContain('this port cannot toggle DTR/RTS')
    expect(msg).toContain('fell back to the slower default reset')
  })
})

describe('flashFirmware teardown', () => {
  const makePort = (): SerialPort =>
    ({
      open: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
      setSignals: vi.fn(() => Promise.resolve()),
    }) as unknown as SerialPort

  const run = async (port: SerialPort, log: string[]) => {
    const { flashFirmware } = await import('./flash')
    return flashFirmware({
      port,
      bytes: new Uint8Array([0xe9, 0x01]),
      onProgress: () => undefined,
      onLog: (line) => log.push(line),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    esptoolStubs.disconnect.mockResolvedValue(undefined)
    esptoolStubs.main.mockResolvedValue(undefined)
    esptoolStubs.writeFlash.mockResolvedValue(undefined)
    esptoolStubs.softReset.mockResolvedValue(undefined)
    esptoolStubs.chipName = 'ESP32'
  })

  it('always releases the port', async () => {
    const log: string[] = []
    await run(makePort(), log)
    expect(esptoolStubs.disconnect).toHaveBeenCalledTimes(1)
  })

  it('reports a failed port release instead of discarding it', async () => {
    esptoolStubs.disconnect.mockRejectedValue(new Error('port already open'))
    const log: string[] = []

    await run(makePort(), log)

    expect(log.some((line) => line.includes('Serial port release failed'))).toBe(true)
    expect(log.some((line) => line.includes('port already open'))).toBe(true)
  })

  it('reports the failed release without masking the flash error that caused it', async () => {
    esptoolStubs.writeFlash.mockRejectedValue(new Error('write timeout'))
    esptoolStubs.disconnect.mockRejectedValue(new Error('port already open'))
    const log: string[] = []

    await expect(run(makePort(), log)).rejects.toThrow(FlashError)
    expect(log.some((line) => line.includes('Serial port release failed'))).toBe(true)
  })

  it('names the pre-reset failure in the handshake error when the port cannot toggle signals', async () => {
    esptoolStubs.main.mockRejectedValue(new Error('timed out waiting for packet header'))
    const port = { open: vi.fn(() => Promise.resolve()), close: vi.fn(() => Promise.resolve()) }
    const log: string[] = []

    await expect(run(port as unknown as SerialPort, log)).rejects.toThrow(/cannot toggle DTR\/RTS/)
  })

  it('keeps flashing when the final soft reset fails, and says what to do', async () => {
    esptoolStubs.softReset.mockRejectedValue(new Error('no response'))
    const log: string[] = []

    await run(makePort(), log)

    expect(log.some((line) => line.includes('unplug/replug to restart the dash'))).toBe(true)
  })
})
