import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SHIPPED_PROFILE_COUNT } from './ecu-catalogue'

const manifestPath = fileURLToPath(
  new URL('../../public/ecu-catalogue/index.json', import.meta.url)
)

const shippedEntryCount = (): number => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { entries: unknown[] }
  return manifest.entries.length
}

describe('SHIPPED_PROFILE_COUNT', () => {
  it('matches the entry count of the shipped catalogue manifest', () => {
    expect(SHIPPED_PROFILE_COUNT).toBe(shippedEntryCount())
  })
})
