import { describe, expect, it } from 'vitest'
import { CATALOGUE_INDEX, hasCatalogueXml, loadCatalogueXml } from './ecu-catalogue'

describe('the bundled ECU catalogue', () => {
  it('ships every vendor definition the manifest lists', () => {
    expect(CATALOGUE_INDEX.entries.length).toBeGreaterThan(0)
    const missing = CATALOGUE_INDEX.entries.filter((entry) => !hasCatalogueXml(entry.id))
    expect(missing).toEqual([])
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
