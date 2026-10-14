import manifest from '../assets/ecu-catalogue/index.json'

export interface CatalogueEntry {
  id: string
  vendor: string
  label: string
}

export interface CatalogueIndex {
  entries: readonly CatalogueEntry[]
  labels: ReadonlyMap<string, string>
}

const XML_ROOT = '../assets/ecu-catalogue/'

const XML_SOURCES = import.meta.glob<string>('../assets/ecu-catalogue/**/*.xml', {
  query: '?raw',
  import: 'default',
})

const toEntry = ({ id, vendor, label }: CatalogueEntry): CatalogueEntry => ({ id, vendor, label })

const ENTRIES: readonly CatalogueEntry[] = manifest.entries.map(toEntry)

export const CATALOGUE_INDEX: CatalogueIndex = {
  entries: ENTRIES,
  labels: new Map(ENTRIES.map((entry) => [entry.id, entry.label])),
}

export const hasCatalogueXml = (id: string): boolean => `${XML_ROOT}${id}` in XML_SOURCES

export const loadCatalogueXml = async (id: string): Promise<string | null> => {
  const load = XML_SOURCES[`${XML_ROOT}${id}`]
  return load === undefined ? null : load()
}
