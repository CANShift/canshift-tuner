import { useMemo } from 'react'
import { useProjectStore } from '../stores/project/project.store'
import { readProject } from '../stores/project/storage'
import { benchEntryFrom, type BenchEntry } from '../lib/bench-entry'
import { ecuLabelForKey } from '../utils/ecu-label'
import { useCatalogueIndex } from './useCatalogueIndex'

export const useBenchEntries = (): BenchEntry[] => {
  const projects = useProjectStore((s) => s.projects)
  const catalogue = useCatalogueIndex()

  return useMemo(
    () =>
      projects.flatMap((meta) => {
        const project = readProject(meta.id)
        if (!project) return []
        return [benchEntryFrom(project, meta, ecuLabelForKey(project.ecuProfileKey, catalogue))]
      }),
    [projects, catalogue]
  )
}
