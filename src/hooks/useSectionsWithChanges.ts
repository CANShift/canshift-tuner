import { useMemo } from 'react'
import type { ChangeSection } from '../lib/sync/change'
import { useChanges } from './useChanges'

export const useSectionsWithChanges = (): ReadonlySet<ChangeSection> => {
  const changes = useChanges()
  return useMemo(() => new Set(changes.map((change) => change.section)), [changes])
}
