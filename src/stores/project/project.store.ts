import { create } from 'zustand'
import {
  PROJECT_FILE_VERSION,
  PROJECT_NAME_MAX,
  describeCanshiftFileError,
  parseCanshiftFile,
  resolveScreenProfile,
  serializeCanshiftFile,
} from '@canshift/core'
import type { DashboardConfig, Project, ProjectMeta } from '@canshift/core'
import { createId } from '../../utils/id'
import { useDashboardStore } from '../dashboard.store'
import { useSignalStore, DEFAULT_PROFILE_KEY } from '../signal.store'
import { readProject, readProjectIndex, writeProject, writeProjectIndex } from './storage'

export const DEFAULT_PROJECT_NAME = 'My dashboard'

export type ImportResult =
  | { ok: true; id: string; name: string; panelSwitchedTo: string | null }
  | { ok: false; error: string }

interface ProjectState {
  projects: ProjectMeta[]
  activeProjectId: string | null
  renameProject: (id: string, name: string) => void
  importProject: (raw: string) => ImportResult
  exportProject: (id: string) => string | null
  saveActiveProject: () => void
}

const nowIso = (): string => new Date().toISOString()

const assembleActiveProject = (meta: ProjectMeta | null): Project | null => {
  const dashboard = useDashboardStore.getState().config
  if (!dashboard || !meta) return null
  const signalState = useSignalStore.getState()
  return {
    projectVersion: PROJECT_FILE_VERSION,
    id: meta.id,
    name: meta.name,
    createdAt: meta.createdAt,
    updatedAt: nowIso(),
    dashboard,
    ecuProfileKey: signalState.selectedProfileKey || DEFAULT_PROFILE_KEY,
    signals: signalState.signals,
  }
}

const loadProjectIntoStores = (project: Project): void => {
  useDashboardStore.getState().setConfig(project.dashboard as DashboardConfig)
  useSignalStore.getState().applyProfile(project.ecuProfileKey, project.signals)
}

const persistIndex = (projects: ProjectMeta[], activeId: string | null): void => {
  writeProjectIndex({ activeId, projects })
}

const upsertMeta = (projects: ProjectMeta[], meta: ProjectMeta): ProjectMeta[] => {
  const rest = projects.filter((p) => p.id !== meta.id)
  return [...rest, meta].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

const projectState = (): ProjectState => useProjectStore.getState()

const setProjects = (projects: ProjectMeta[], activeProjectId: string | null): void => {
  useProjectStore.setState({ projects, activeProjectId })
  persistIndex(projects, activeProjectId)
}

const saveActiveProject = (): void => {
  const { activeProjectId, projects } = projectState()
  const meta = projects.find((p) => p.id === activeProjectId)
  if (!meta) return
  const project = assembleActiveProject(meta)
  if (!project || !writeProject(project)) return
  setProjects(upsertMeta(projects, { ...meta, updatedAt: project.updatedAt }), meta.id)
}

const renameProject = (id: string, name: string): void => {
  const trimmed = name.trim().slice(0, PROJECT_NAME_MAX)
  if (trimmed.length === 0) return
  const project = readProject(id)
  if (project && !writeProject({ ...project, name: trimmed, updatedAt: nowIso() })) return
  const { projects, activeProjectId } = projectState()
  setProjects(
    projects.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
    activeProjectId
  )
}

const adoptProject = (project: Project): void => {
  const meta: ProjectMeta = {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
  setProjects(upsertMeta(projectState().projects, meta), project.id)
  loadProjectIntoStores(project)
}

const panelOf = (dashboard: unknown) =>
  resolveScreenProfile((dashboard as DashboardConfig | null)?.targetProfile)

const importProject = (raw: string): ImportResult => {
  const result = parseCanshiftFile(raw)
  if (result.kind !== 'ok') return { ok: false, error: describeCanshiftFileError(result) }
  saveActiveProject()
  const before = panelOf(useDashboardStore.getState().config)
  const imported: Project = { ...result.project, id: createId('proj'), updatedAt: nowIso() }
  if (!writeProject(imported)) return { ok: false, error: 'Could not save the imported project.' }
  adoptProject(imported)
  const after = panelOf(imported.dashboard)
  const panelSwitchedTo = after.id === before.id ? null : after.name
  return { ok: true, id: imported.id, name: imported.name, panelSwitchedTo }
}

const exportProject = (id: string): string | null => {
  if (id === projectState().activeProjectId) saveActiveProject()
  const project = readProject(id)
  return project ? serializeCanshiftFile(project) : null
}

export const useProjectStore = create<ProjectState>()(() => ({
  projects: [],
  activeProjectId: null,
  saveActiveProject,
  renameProject,
  importProject,
  exportProject,
}))

const restoreIndexedProjects = (
  projects: ProjectMeta[],
  requestedActiveId: string | null
): void => {
  const activeId =
    requestedActiveId !== null && projects.some((p) => p.id === requestedActiveId)
      ? requestedActiveId
      : (projects[0]?.id ?? null)
  useProjectStore.setState({ projects, activeProjectId: activeId })
  if (activeId === null) return
  const active = readProject(activeId)
  if (!active) return
  if (useDashboardStore.getState().config === null) loadProjectIntoStores(active)
}

export const bootstrapProjects = (): void => {
  const index = readProjectIndex()
  if (index !== null && index.projects.length > 0) {
    restoreIndexedProjects(index.projects, index.activeId)
    return
  }

  const dashboard = useDashboardStore.getState().config
  if (!dashboard) return
  const id = createId('proj')
  const createdAt = nowIso()
  const signalState = useSignalStore.getState()
  const project: Project = {
    projectVersion: PROJECT_FILE_VERSION,
    id,
    name: dashboard.name || DEFAULT_PROJECT_NAME,
    createdAt,
    updatedAt: createdAt,
    dashboard,
    ecuProfileKey: signalState.selectedProfileKey || DEFAULT_PROFILE_KEY,
    signals: signalState.signals,
  }
  if (!writeProject(project)) return
  const projects: ProjectMeta[] = [{ id, name: project.name, createdAt, updatedAt: createdAt }]
  useProjectStore.setState({ projects, activeProjectId: id })
  persistIndex(projects, id)
}
