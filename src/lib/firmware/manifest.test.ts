import { describe, expect, it } from 'vitest'
import { boardLabel, findBoard, parseManifest } from './manifest'

const MANIFEST = JSON.stringify({
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
        merged: 'canshift-crowpanel_28-v1.4.0-merged.bin',
        firmware: 'canshift-crowpanel_28-v1.4.0-firmware.bin',
        spiffs: 'canshift-crowpanel_28-v1.4.0-spiffs.bin',
      },
    },
    {
      id: 'generic_ili9341_gt911',
      chip: 'esp32',
      display: 'ILI9341 320x240',
      touch: 'GT911',
      artifacts: {
        merged: 'canshift-generic_ili9341_gt911-v1.4.0-merged.bin',
        firmware: 'canshift-generic_ili9341_gt911-v1.4.0-firmware.bin',
        spiffs: 'canshift-generic_ili9341_gt911-v1.4.0-spiffs.bin',
      },
    },
  ],
})

describe('parseManifest', () => {
  it('parses a well-formed manifest and its boards', () => {
    const manifest = parseManifest(MANIFEST)
    expect(manifest).not.toBeNull()
    if (!manifest) return
    expect(manifest.boards).toHaveLength(2)
    expect(findBoard(manifest, 'crowpanel_28')?.artifacts.merged).toBe(
      'canshift-crowpanel_28-v1.4.0-merged.bin'
    )
  })

  it('returns null for invalid JSON, wrong shape, or an empty board list', () => {
    expect(parseManifest('not json')).toBeNull()
    expect(parseManifest(JSON.stringify({ schema: 1 }))).toBeNull()
    expect(
      parseManifest(JSON.stringify({ schema: 1, version: '1', tag: 'v1', boards: [] }))
    ).toBeNull()
    expect(
      parseManifest(JSON.stringify({ schema: 1, version: '1', tag: 'v1', boards: [{ id: 'x' }] }))
    ).toBeNull()
  })

  it('labels a board slug in a human-readable way', () => {
    expect(boardLabel('crowpanel_28')).toBe('Crowpanel 28')
    expect(boardLabel('generic_ili9341_gt911')).toBe('Generic Ili9341 Gt911')
  })
})
