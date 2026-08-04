import { create } from 'zustand'
import type { PageConfig } from '@canshift/core'
import { PAGE_TEMPLATE_NAME_MAX } from '../../lib/page-template'
import { createId } from '../../utils/id'
import { captureFlowEvent } from '../../lib/posthog'
import { readTemplates, writeTemplates, type PageTemplateEntry } from './storage'

interface TemplateState {
  templates: PageTemplateEntry[]
  saveTemplate: (name: string, page: PageConfig) => string
  renameTemplate: (id: string, name: string) => void
  deleteTemplate: (id: string) => void
}

const nowIso = (): string => new Date().toISOString()

const normalizeName = (name: string): string => name.trim().slice(0, PAGE_TEMPLATE_NAME_MAX)

const persist = (templates: PageTemplateEntry[]): void => {
  writeTemplates(templates)
}

export const useTemplateStore = create<TemplateState>()((set, get) => ({
  templates: readTemplates(),

  saveTemplate: (name, page) => {
    const id = createId('tmpl')
    const entry: PageTemplateEntry = {
      id,
      name: normalizeName(name) || 'Untitled template',
      createdAt: nowIso(),
      page: structuredClone(page),
    }
    const next = [entry, ...get().templates]
    set({ templates: next })
    persist(next)
    captureFlowEvent('page_template_saved')
    return id
  },

  renameTemplate: (id, name) => {
    const trimmed = normalizeName(name)
    if (trimmed.length === 0) return
    const next = get().templates.map((t) => (t.id === id ? { ...t, name: trimmed } : t))
    set({ templates: next })
    persist(next)
  },

  deleteTemplate: (id) => {
    const next = get().templates.filter((t) => t.id !== id)
    set({ templates: next })
    persist(next)
  },
}))
