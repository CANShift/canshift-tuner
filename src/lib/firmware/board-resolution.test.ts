import { describe, expect, it } from 'vitest'
import type { BoardManifest } from './manifest'
import { chipFamiliesMatch, resolveBoardSelection } from './board-resolution'

const manifest = (): BoardManifest => ({
  schema: 1,
  version: '1.4.0',
  tag: 'v1.4.0',
  boards: [
    {
      id: 'crowpanel_28',
      chip: 'esp32',
      display: 'ILI9341 320x240',
      touch: 'XPT2046',
      artifacts: {
        merged: { file: 'a-merged.bin', sha256: null },
        firmware: { file: 'a-firmware.bin', sha256: null },
        spiffs: { file: 'a-spiffs.bin', sha256: null },
      },
    },
    {
      id: 'generic_ili9341_gt911',
      chip: 'esp32',
      display: 'ILI9341 320x240',
      touch: 'GT911',
      artifacts: {
        merged: { file: 'b-merged.bin', sha256: null },
        firmware: { file: 'b-firmware.bin', sha256: null },
        spiffs: { file: 'b-spiffs.bin', sha256: null },
      },
    },
  ],
})

describe('resolveBoardSelection', () => {
  it('preselects the detected board when its id is in the manifest', () => {
    const resolution = resolveBoardSelection(manifest(), 'generic_ili9341_gt911')
    expect(resolution.source).toBe('detected')
    expect(resolution.selectedId).toBe('generic_ili9341_gt911')
  })

  it('falls back to the first board when nothing is detected', () => {
    const resolution = resolveBoardSelection(manifest(), null)
    expect(resolution.source).toBe('default')
    expect(resolution.selectedId).toBe('crowpanel_28')
  })

  it('ignores a detected id that is not in the manifest and defaults instead', () => {
    const resolution = resolveBoardSelection(manifest(), 'unknown_board')
    expect(resolution.source).toBe('default')
    expect(resolution.selectedId).toBe('crowpanel_28')
  })

  it('reports no boards when there is no manifest (old release fallback)', () => {
    const resolution = resolveBoardSelection(null, 'crowpanel_28')
    expect(resolution.source).toBe('none')
    expect(resolution.selectedId).toBeNull()
    expect(resolution.boards).toHaveLength(0)
  })
})

describe('chipFamiliesMatch', () => {
  it('matches case- and separator-insensitively', () => {
    expect(chipFamiliesMatch('esp32', 'ESP32')).toBe(true)
    expect(chipFamiliesMatch('esp32-s3', 'ESP32-S3')).toBe(true)
    expect(chipFamiliesMatch('esp32', 'ESP32-S3')).toBe(false)
  })
})
