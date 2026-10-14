import { describe, expect, it } from 'vitest'
import { CATALOGUE_INDEX } from './ecu-catalogue'
import { loadCatalogueProfile } from './catalogue-profile'

describe('loadCatalogueProfile', () => {
  it('loads a shipped entry with its vendor in the label', async () => {
    const first = CATALOGUE_INDEX.entries[0]
    if (!first) throw new Error('empty catalogue')
    const profile = await loadCatalogueProfile(first.id)
    expect(profile).toMatchObject({ kind: 'ok', label: `${first.vendor} · ${first.label}` })
  })

  it('names an id the catalogue does not have', async () => {
    expect(await loadCatalogueProfile('nope')).toEqual({
      kind: 'error',
      message: 'The catalogue has no entry called "nope"',
    })
  })
})
