import { describe, expect, it } from 'vitest'
import type { BoardManifest } from '../lib/firmware/manifest'
import { resolveManifestForRelease } from './useFirmwareManifest'

const manifest: BoardManifest = {
  schema: 1,
  version: '1.0.0',
  tag: 'v1.0.0',
  boards: [
    {
      id: 'crowpanel_28',
      chip: 'esp32',
      display: 'ILI9341 320x240',
      touch: 'XPT2046',
      artifacts: {
        merged: { file: 'm.bin', sha256: null },
        firmware: { file: 'f.bin', sha256: null },
        spiffs: { file: 's.bin', sha256: null },
      },
    },
  ],
}

describe('resolveManifestForRelease', () => {
  it('returns the scoped state when it matches the requested release', () => {
    const result = resolveManifestForRelease('v1.0.0', {
      tag: 'v1.0.0',
      state: { kind: 'ok', manifest },
    })
    expect(result).toEqual({ kind: 'ok', manifest })
  })

  it('returns loading (never the previous manifest) while switching to another release', () => {
    const result = resolveManifestForRelease('v2.0.0', {
      tag: 'v1.0.0',
      state: { kind: 'ok', manifest },
    })
    expect(result).toEqual({ kind: 'loading' })
  })

  it('returns idle when no release is requested', () => {
    const result = resolveManifestForRelease(null, {
      tag: 'v1.0.0',
      state: { kind: 'ok', manifest },
    })
    expect(result).toEqual({ kind: 'idle' })
  })
})
