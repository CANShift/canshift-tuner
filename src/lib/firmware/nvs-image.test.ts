import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildNvsImage } from './nvs-image'

const goldenPath = fileURLToPath(new URL('./__fixtures__/nvs-golden.bin', import.meta.url))
const goldenValuePath = fileURLToPath(
  new URL('./__fixtures__/nvs-golden-value.txt', import.meta.url)
)

const PARTITION_SIZE = 0x5000

describe('buildNvsImage', () => {
  it('matches esp-idf-nvs-partition-gen byte for byte', () => {
    const value = readFileSync(goldenValuePath, 'utf8')
    const golden = new Uint8Array(readFileSync(goldenPath))

    const built = buildNvsImage('boardcfg', 'profile', value, PARTITION_SIZE)

    expect(built.length).toBe(golden.length)
    expect(Buffer.from(built).equals(Buffer.from(golden))).toBe(true)
  })

  it('stores the string NUL-terminated, as Preferences::putString reads it', () => {
    const image = buildNvsImage('boardcfg', 'profile', 'hi', PARTITION_SIZE)
    const entriesStart = 32 + 32
    const stringEntryStart = entriesStart + 32
    const dataStart = stringEntryStart + 32
    const storedSize = new DataView(image.buffer).getUint16(stringEntryStart + 24, true)

    expect(image[dataStart]).toBe('h'.charCodeAt(0))
    expect(image[dataStart + 1]).toBe('i'.charCodeAt(0))
    expect(image[dataStart + 2]).toBe(0)
    expect(storedSize).toBe(3)
  })

  it('leaves every page after the first erased', () => {
    const image = buildNvsImage('boardcfg', 'profile', 'hi', PARTITION_SIZE)
    const tail = image.subarray(4096)

    expect(tail.every((byte) => byte === 0xff)).toBe(true)
  })

  it('rejects a partition that is not a whole number of pages', () => {
    expect(() => buildNvsImage('boardcfg', 'profile', 'hi', 0x5001)).toThrow(/whole number/)
  })

  it('rejects a partition smaller than the three pages NVS needs', () => {
    expect(() => buildNvsImage('boardcfg', 'profile', 'hi', 4096 * 2)).toThrow(/at least/)
  })

  it('rejects a key longer than the 15-character field', () => {
    expect(() => buildNvsImage('boardcfg', 'x'.repeat(16), 'hi', PARTITION_SIZE)).toThrow(/1\.\.15/)
  })

  it('rejects a value that overflows a single page', () => {
    expect(() => buildNvsImage('boardcfg', 'profile', 'x'.repeat(4001), PARTITION_SIZE)).toThrow(
      /page holds 126/
    )
  })
})
