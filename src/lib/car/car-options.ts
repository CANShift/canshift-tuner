import { CATALOGUE_INDEX } from '../ecu-catalogue'
import { profileGroups } from '../profile-options'

export interface CarOption {
  key: string
  label: string
  make: string
}

export const carOptions = (currentKey: string, currentLabel: string): CarOption[] =>
  profileGroups(CATALOGUE_INDEX.entries, currentKey, currentLabel).flatMap((group) =>
    group.options.map((option) => ({ key: option.key, label: option.label, make: group.label }))
  )

export const matchingCars = (options: readonly CarOption[], query: string): CarOption[] => {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return [...options]
  return options.filter((option) => `${option.make} ${option.label}`.toLowerCase().includes(needle))
}
