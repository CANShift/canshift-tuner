import { describe, expect, it } from 'vitest'
import { assertChipMatchesBoard, FlashError } from './flash'

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
