import { ECU_PROFILES } from '@canshift/core'
import type { CatalogueIndex } from '../hooks/useCatalogueIndex'
import { prettyProfileKey } from './profile-key'

const titleCase = (value: string): string => value.replace(/\b[a-z]/g, (char) => char.toUpperCase())

const catalogueFallback = (itemId: string): string => {
  const file = itemId.split('/').pop() ?? itemId
  return titleCase(file.replace(/\.xml$/i, '').replace(/[-_]/g, ' '))
}

const RESOLVERS: Record<string, (rest: string, index: CatalogueIndex) => string> = {
  builtin: (rest) => ECU_PROFILES.find((profile) => profile.id === rest)?.name ?? titleCase(rest),
  catalogue: (rest, index) => index.get(rest) ?? catalogueFallback(rest),
  import: (rest) => rest.replace(/\.xml$/i, ''),
}

export const ecuLabelForKey = (key: string, index: CatalogueIndex): string => {
  const separator = key.indexOf(':')
  if (separator === -1) return titleCase(prettyProfileKey(key))
  const resolve = RESOLVERS[key.slice(0, separator)]
  if (!resolve) return titleCase(prettyProfileKey(key))
  return resolve(key.slice(separator + 1), index)
}
