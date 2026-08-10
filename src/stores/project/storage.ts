import {
  CURRENT_SCHEMA_VERSION,
  PROJECT_FILE_VERSION,
  ProjectSchema,
  migrateConfig,
} from '@canshift/core'
import type { Project, ProjectMeta } from '@canshift/core'
import {
  readItem,
  writeItem,
  removeItem,
  projectStorageKey,
  STORAGE_KEYS,
} from '../../lib/local-storage'

export const PROJECT_INDEX_KEY = STORAGE_KEYS.projectIndex

export interface ProjectIndex {
  activeId: string | null
  projects: ProjectMeta[]
}

export const readProjectIndex = (): ProjectIndex | null => {
  const raw = readItem(PROJECT_INDEX_KEY)
  if (raw === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const candidate = parsed as { activeId?: unknown; projects?: unknown }
  if (!Array.isArray(candidate.projects)) return null
  const projects = candidate.projects.filter(
    (p): p is ProjectMeta =>
      typeof p === 'object' &&
      p !== null &&
      typeof (p as ProjectMeta).id === 'string' &&
      typeof (p as ProjectMeta).name === 'string' &&
      typeof (p as ProjectMeta).createdAt === 'string' &&
      typeof (p as ProjectMeta).updatedAt === 'string'
  )
  const activeId = typeof candidate.activeId === 'string' ? candidate.activeId : null
  return { activeId, projects }
}

export const writeProjectIndex = (index: ProjectIndex): void => {
  writeItem(PROJECT_INDEX_KEY, JSON.stringify(index))
}

export const deserializeProject = (raw: string): Project | null => {
  let outer: unknown
  try {
    outer = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof outer !== 'object' || outer === null) return null

  const candidate = outer as Record<string, unknown>
  try {
    candidate.dashboard = migrateConfig(
      candidate.dashboard as Record<string, unknown>,
      CURRENT_SCHEMA_VERSION
    ).config
  } catch {
    return null
  }
  const parsed = ProjectSchema.safeParse(candidate)
  return parsed.success ? parsed.data : null
}

export const readProject = (id: string): Project | null => {
  const raw = readItem(projectStorageKey(id))
  if (raw === null) return null
  return deserializeProject(raw)
}

export const writeProject = (project: Project): boolean => {
  if (!ProjectSchema.safeParse(project).success) return false
  return writeItem(projectStorageKey(project.id), JSON.stringify(project))
}

export const removeProject = (id: string): void => {
  removeItem(projectStorageKey(id))
}

export { projectStorageKey }

export const PROJECT_VERSION = PROJECT_FILE_VERSION
