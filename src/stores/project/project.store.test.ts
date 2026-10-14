import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { useDashboardStore } from '../dashboard.store'
import { bootstrapProjects, useProjectStore } from './project.store'
import { readProject, readProjectIndex } from './storage'

const memoryStorage = (): Storage => {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => {
      map.clear()
    },
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k)
    },
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
  }
}

const freshConfig = () => structuredClone(DEFAULT_SIM_CONFIG)

beforeEach(() => {
  globalThis.localStorage = memoryStorage()
  useProjectStore.setState({ projects: [], activeProjectId: null })
  useDashboardStore.getState().setConfig(freshConfig())
})

describe('project store bootstrap', () => {
  it('bootstrap adopts the current editor state as the first project', () => {
    bootstrapProjects()

    const { projects, activeProjectId } = useProjectStore.getState()
    expect(projects).toHaveLength(1)
    expect(activeProjectId).toBe(projects[0]?.id)

    const stored = readProject(activeProjectId ?? '')
    expect(stored?.dashboard.defaultPageId).toBe(DEFAULT_SIM_CONFIG.defaultPageId)
    expect(readProjectIndex()?.activeId).toBe(activeProjectId)
  })
})

const expectSameContent = (importedId: string, originalId: string) => {
  const imported = readProject(importedId)
  const original = readProject(originalId)
  expect(imported?.name).toBe(original?.name)
  expect(imported?.dashboard.defaultPageId).toBe(original?.dashboard.defaultPageId)
  expect(imported?.signals).toEqual(original?.signals)
}

describe('project store round trip', () => {
  it('exports and re-imports a project as a new copy without data loss', () => {
    bootstrapProjects()
    const originalId = useProjectStore.getState().activeProjectId ?? ''

    const json = useProjectStore.getState().exportProject(originalId)
    expect(json).not.toBeNull()

    const envelope = JSON.parse(json ?? '{}') as { format: string; formatVersion: number }
    expect(envelope.format).toBe('canshift')
    expect(envelope.formatVersion).toBeGreaterThanOrEqual(1)

    const result = useProjectStore.getState().importProject(json ?? '')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.id).not.toBe(originalId)
    expect(useProjectStore.getState().activeProjectId).toBe(result.id)
    expect(useProjectStore.getState().projects).toHaveLength(2)
    expectSameContent(result.id, originalId)
  })
})

describe('project store bad imports', () => {
  it('reports a distinct readable error for each kind of bad import', () => {
    bootstrapProjects()
    const activeId = useProjectStore.getState().activeProjectId ?? ''
    const envelope = useProjectStore.getState().exportProject(activeId) ?? ''
    const bumped = JSON.parse(envelope) as { formatVersion: number }
    bumped.formatVersion = 999

    const invalidJson = useProjectStore.getState().importProject('not json')
    const notCanshift = useProjectStore.getState().importProject('{"foo":1}')
    const tooNew = useProjectStore.getState().importProject(JSON.stringify(bumped))

    expect(invalidJson.ok).toBe(false)
    expect(notCanshift.ok).toBe(false)
    expect(tooNew.ok).toBe(false)
    if (invalidJson.ok || notCanshift.ok || tooNew.ok) return

    expect(notCanshift.error).toContain('.canshift file')
    expect(notCanshift.error).not.toBe(invalidJson.error)
    expect(tooNew.error).toContain('Update CANShift')
    expect(useProjectStore.getState().projects).toHaveLength(1)
  })
})

describe('project store export flush', () => {
  it('export flushes pending editor edits into the envelope before serializing', () => {
    bootstrapProjects()
    const id = useProjectStore.getState().activeProjectId ?? ''
    useDashboardStore.getState().updatePage(DEFAULT_SIM_CONFIG.defaultPageId, { visible: false })

    const json = useProjectStore.getState().exportProject(id)
    const parsed = JSON.parse(json ?? '{}') as {
      project: { dashboard: { pages: { id: string; visible: boolean }[] } }
    }
    const page = parsed.project.dashboard.pages.find(
      (p) => p.id === DEFAULT_SIM_CONFIG.defaultPageId
    )
    expect(page?.visible).toBe(false)
  })
})
