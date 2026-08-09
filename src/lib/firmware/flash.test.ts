import { describe, expect, it } from 'vitest'
import { assertChipMatchesBoard, flashFileArray, FlashError } from './flash'

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
