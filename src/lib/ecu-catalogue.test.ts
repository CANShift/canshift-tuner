import { parseCanXml } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { CATALOGUE_INDEX, loadCatalogueXml } from './ecu-catalogue'

const loadAll = async (): Promise<{ id: string; xml: string | null }[]> =>
  Promise.all(
    CATALOGUE_INDEX.entries.map(async (entry) => ({
      id: entry.id,
      xml: await loadCatalogueXml(entry.id),
    }))
  )

describe('the bundled ECU catalogue', () => {
  it('ships every vendor definition the manifest lists', async () => {
    expect(CATALOGUE_INDEX.entries.length).toBeGreaterThan(0)
    const loaded = await loadAll()
    expect(loaded.filter((entry) => entry.xml === null).map((entry) => entry.id)).toEqual([])
  })

  it('loads a definition from the bundle, without the network', async () => {
    const first = CATALOGUE_INDEX.entries[0]
    if (first === undefined) throw new Error('empty catalogue')
    const xml = await loadCatalogueXml(first.id)
    expect(xml).toContain('<')
  })

  it('answers null for an id the catalogue does not hold', async () => {
    await expect(loadCatalogueXml('nobody/nothing.xml')).resolves.toBeNull()
  })

  it('labels every entry by id', () => {
    for (const entry of CATALOGUE_INDEX.entries) {
      expect(CATALOGUE_INDEX.labels.get(entry.id)).toBe(entry.label)
    }
  })
})

describe('the bundled ECU definitions', () => {
  it('parses signals out of every vendor definition', async () => {
    const loaded = await loadAll()
    const silent = loaded.filter((entry) => parseCanXml(entry.xml ?? '').signals.length === 0)
    expect(silent.map((entry) => entry.id)).toEqual([])
  })

  it('roots every definition on the neutral CAN XML tag', async () => {
    const loaded = await loadAll()
    const foreign = loaded.filter((entry) => !entry.xml?.includes('<CanXml version="2">'))
    expect(foreign.map((entry) => entry.id)).toEqual([])
  })
})
