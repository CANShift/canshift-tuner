import { beforeEach, describe, expect, it } from 'vitest'
import type { PageConfig } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { useTemplateStore } from './template.store'
import { readTemplates } from './storage'

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

const samplePage = (): PageConfig => {
  const page = DEFAULT_SIM_CONFIG.pages[0]
  if (!page) throw new Error('sim config has no pages')
  return structuredClone(page)
}

describe('template store', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage()
    useTemplateStore.setState({ templates: [] })
  })

  it('saves a page as a template and persists it project-independently', () => {
    const id = useTemplateStore.getState().saveTemplate('Street layout', samplePage())

    expect(useTemplateStore.getState().templates).toHaveLength(1)
    const stored = readTemplates()
    expect(stored).toHaveLength(1)
    expect(stored[0]?.id).toBe(id)
    expect(stored[0]?.name).toBe('Street layout')
    expect(stored[0]?.page.widgets.length).toBe(samplePage().widgets.length)
  })

  it('renames a template and persists the change', () => {
    const id = useTemplateStore.getState().saveTemplate('Old', samplePage())
    useTemplateStore.getState().renameTemplate(id, 'New name')

    expect(useTemplateStore.getState().templates[0]?.name).toBe('New name')
    expect(readTemplates()[0]?.name).toBe('New name')
  })

  it('ignores a blank rename', () => {
    const id = useTemplateStore.getState().saveTemplate('Keep', samplePage())
    useTemplateStore.getState().renameTemplate(id, '   ')

    expect(useTemplateStore.getState().templates[0]?.name).toBe('Keep')
  })

  it('deletes a template and persists the removal', () => {
    const id = useTemplateStore.getState().saveTemplate('Gone', samplePage())
    useTemplateStore.getState().deleteTemplate(id)

    expect(useTemplateStore.getState().templates).toHaveLength(0)
    expect(readTemplates()).toHaveLength(0)
  })
})
