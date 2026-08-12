import { describe, expect, it } from 'vitest'
import { boardLabel, findBoard, parseManifest } from './manifest'

const SHA = 'a'.repeat(64)

const SCHEMA_2_MANIFEST = JSON.stringify({
  schema: 2,
  version: '2.0.0',
  tag: 'v2.0.0',
  boards: [
    {
      id: 'crowpanel_28',
      chip: 'esp32',
      display: 'ILI9341 320x240',
      touch: 'XPT2046',
      artifacts: {
        merged: { file: 'canshift-crowpanel_28-v2.0.0-merged.bin', sha256: SHA },
        firmware: { file: 'canshift-crowpanel_28-v2.0.0-firmware.bin', sha256: SHA },
        spiffs: { file: 'canshift-crowpanel_28-v2.0.0-spiffs.bin', sha256: SHA },
      },
    },
  ],
})

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
    expect(findBoard(manifest, 'crowpanel_28')?.artifacts.merged).toEqual({
      file: 'canshift-crowpanel_28-v1.4.0-merged.bin',
      sha256: null,
    })
  })

  it('reads the schema-2 object form and keeps the checksum', () => {
    const manifest = parseManifest(SCHEMA_2_MANIFEST)
    expect(manifest).not.toBeNull()
    if (!manifest) return
    expect(findBoard(manifest, 'crowpanel_28')?.artifacts.merged).toEqual({
      file: 'canshift-crowpanel_28-v2.0.0-merged.bin',
      sha256: SHA,
    })
    expect(findBoard(manifest, 'crowpanel_28')?.artifacts.spiffs.sha256).toBe(SHA)
  })

  it('uppercases are normalised and a malformed checksum degrades to null', () => {
    const raw = JSON.stringify({
      schema: 2,
      version: '2.0.0',
      tag: 'v2.0.0',
      boards: [
        {
          id: 'b',
          chip: 'esp32',
          display: 'd',
          touch: 't',
          artifacts: {
            merged: { file: 'm.bin', sha256: SHA.toUpperCase() },
            firmware: { file: 'f.bin', sha256: 'not-a-digest' },
            spiffs: { file: 's.bin' },
          },
        },
      ],
    })
    const board = findBoard(parseManifest(raw)!, 'b')
    expect(board?.artifacts.merged.sha256).toBe(SHA)
    expect(board?.artifacts.firmware.sha256).toBeNull()
    expect(board?.artifacts.spiffs.sha256).toBeNull()
  })

  it('rejects an artifact entry with no filename in either shape', () => {
    const withArtifacts = (artifacts: unknown) =>
      JSON.stringify({
        schema: 2,
        version: '1',
        tag: 'v1',
        boards: [{ id: 'b', chip: 'c', display: 'd', touch: 't', artifacts }],
      })
    expect(parseManifest(withArtifacts({ merged: '', firmware: 'f', spiffs: 's' }))).toBeNull()
    expect(
      parseManifest(withArtifacts({ merged: { sha256: SHA }, firmware: 'f', spiffs: 's' }))
    ).toBeNull()
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
