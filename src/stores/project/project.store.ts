import { create } from 'zustand'
import {
  PROJECT_FILE_VERSION,
  PROJECT_NAME_MAX,
  describeCanshiftFileError,
  parseCanshiftFile,
  serializeCanshiftFile,
} from '@canshift/core'
import type { DashboardConfig, Project, ProjectMeta, SignalDef } from '@canshift/core'
import { createId } from '../../utils/id'
import { captureFlowEvent } from '../../lib/posthog'
import { useDashboardStore } from '../dashboard.store'
import { useSignalStore, DEFAULT_PROFILE_KEY } from '../signal.store'
import {
  readProject,
  readProjectIndex,
  removeProject,
  writeProject,
  writeProjectIndex,
} from './storage'

export const DEFAULT_PROJECT_NAME = 'My dashboard'

export type ImportResult = { ok: true; id: string; name: string } | { ok: false; error: string }

export interface ProjectEcuProfile {
  key: string
  signals: SignalDef[]
}

interface ProjectState {
  projects: ProjectMeta[]
  activeProjectId: string | null
  createProject: (
    name: string,
    dashboard: DashboardConfig,
    ecuProfile?: ProjectEcuProfile
  ) => string
  switchProject: (id: string) => boolean
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => boolean
  duplicateProject: (id: string) => string | null
  importProject: (raw: string) => ImportResult
  exportProject: (id: string) => string | null
  saveActiveProject: () => void
}

const duplicateName = (name: string): string => `${name} copy`.slice(0, PROJECT_NAME_MAX)

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

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  activeProjectId: null,

  saveActiveProject: () => {
    const { activeProjectId, projects } = get()
    if (activeProjectId === null) return
    const meta = projects.find((p) => p.id === activeProjectId)
    if (!meta) return
    const project = assembleActiveProject(meta)
    if (!project) return
    if (!writeProject(project)) return
    const nextProjects = upsertMeta(projects, { ...meta, updatedAt: project.updatedAt })
    set({ projects: nextProjects })
    persistIndex(nextProjects, activeProjectId)
  },

  createProject: (name, dashboard, ecuProfile) => {
    get().saveActiveProject()
    const id = createId('proj')
    const createdAt = nowIso()
    const signalState = useSignalStore.getState()
    const project: Project = {
      projectVersion: PROJECT_FILE_VERSION,
      id,
      name: name.trim().slice(0, PROJECT_NAME_MAX) || DEFAULT_PROJECT_NAME,
      createdAt,
      updatedAt: createdAt,
      dashboard,
      ecuProfileKey: ecuProfile?.key ?? (signalState.selectedProfileKey || DEFAULT_PROFILE_KEY),
      signals: ecuProfile?.signals ?? signalState.signals,
    }
    if (!writeProject(project)) return get().activeProjectId ?? ''
    const nextProjects = upsertMeta(get().projects, {
      id,
      name: project.name,
      createdAt,
      updatedAt: createdAt,
    })
    set({ projects: nextProjects, activeProjectId: id })
    persistIndex(nextProjects, id)
    loadProjectIntoStores(project)
    captureFlowEvent('project_created')
    return id
  },

  switchProject: (id) => {
    const { activeProjectId } = get()
    if (id === activeProjectId) return true
    const target = readProject(id)
    if (!target) return false
    get().saveActiveProject()
    set({ activeProjectId: id })
    persistIndex(get().projects, id)
    loadProjectIntoStores(target)
    captureFlowEvent('project_switched')
    return true
  },

  renameProject: (id, name) => {
    const trimmed = name.trim().slice(0, PROJECT_NAME_MAX)
    if (trimmed.length === 0) return
    const project = readProject(id)
    if (project && !writeProject({ ...project, name: trimmed, updatedAt: nowIso() })) return
    const nextProjects = get().projects.map((p) => (p.id === id ? { ...p, name: trimmed } : p))
    set({ projects: nextProjects })
    persistIndex(nextProjects, get().activeProjectId)
  },

  deleteProject: (id) => {
    const { projects, activeProjectId } = get()
    if (projects.length <= 1) return false
    if (id === activeProjectId) {
      const fallback = projects.find((p) => p.id !== id)
      if (!fallback || !get().switchProject(fallback.id)) return false
    }
    removeProject(id)
    const nextProjects = get().projects.filter((p) => p.id !== id)
    set({ projects: nextProjects })
    persistIndex(nextProjects, get().activeProjectId)
    return true
  },

  duplicateProject: (id) => {
    get().saveActiveProject()
    const source = readProject(id)
    if (!source) return null
    const newId = createId('proj')
    const createdAt = nowIso()
    const copy: Project = {
      ...source,
      id: newId,
      name: duplicateName(source.name),
      createdAt,
      updatedAt: createdAt,
    }
    if (!writeProject(copy)) return null
    const nextProjects = upsertMeta(get().projects, {
      id: newId,
      name: copy.name,
      createdAt,
      updatedAt: createdAt,
    })
    set({ projects: nextProjects, activeProjectId: newId })
    persistIndex(nextProjects, newId)
    loadProjectIntoStores(copy)
    captureFlowEvent('project_duplicated')
    return newId
  },

  importProject: (raw) => {
    const result = parseCanshiftFile(raw)
    if (result.kind !== 'ok') return { ok: false, error: describeCanshiftFileError(result) }
    get().saveActiveProject()
    const newId = createId('proj')
    const imported: Project = { ...result.project, id: newId, updatedAt: nowIso() }
    if (!writeProject(imported)) return { ok: false, error: 'Could not save the imported project.' }
    const nextProjects = upsertMeta(get().projects, {
      id: newId,
      name: imported.name,
      createdAt: imported.createdAt,
      updatedAt: imported.updatedAt,
    })
    set({ projects: nextProjects, activeProjectId: newId })
    persistIndex(nextProjects, newId)
    loadProjectIntoStores(imported)
    captureFlowEvent('project_imported')
    return { ok: true, id: newId, name: imported.name }
  },

  exportProject: (id) => {
    if (id === get().activeProjectId) get().saveActiveProject()
    const project = readProject(id)
    return project ? serializeCanshiftFile(project) : null
  },
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
