import { ECU_PROFILES } from '@canshift/core'
import type { ProfileGroup } from '../components/signals/SignalsToolbar'
import type { CatalogueEntry } from '../hooks/useCatalogueIndex'

const BUILT_IN = 'Built-in'
const CUSTOM = 'Custom'

const byLabel = (a: { label: string }, b: { label: string }): number =>
  a.label.localeCompare(b.label)

const vendorGroups = (entries: readonly CatalogueEntry[]): ProfileGroup[] => {
  const byVendor = new Map<string, ProfileGroup['options'][number][]>()
  for (const entry of entries) {
    const options = byVendor.get(entry.vendor) ?? []
    options.push({ key: `catalogue:${entry.id}`, label: entry.label })
    byVendor.set(entry.vendor, options)
  }
  return [...byVendor.entries()]
    .map(([label, options]) => ({ label, options: [...options].sort(byLabel) }))
    .sort(byLabel)
}

export const profileGroups = (
  entries: readonly CatalogueEntry[],
  currentKey: string,
  currentLabel: string
): ProfileGroup[] => {
  const groups: ProfileGroup[] = [
    {
      label: BUILT_IN,
      options: ECU_PROFILES.map((profile) => ({
        key: `builtin:${profile.id}`,
        label: profile.name,
      })),
    },
    ...vendorGroups(entries),
  ]
  const known = groups.some((group) => group.options.some((option) => option.key === currentKey))
  if (known) return groups
  return [{ label: CUSTOM, options: [{ key: currentKey, label: currentLabel }] }, ...groups]
}
