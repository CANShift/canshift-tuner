import type { PageConfig } from '@canshift/core'
import { readItem, writeItem, STORAGE_KEYS } from '../../lib/local-storage'

export const PAGE_TEMPLATES_KEY = STORAGE_KEYS.pageTemplates

export interface PageTemplateEntry {
  id: string
  name: string
  createdAt: string
  page: PageConfig
}

const isEntry = (value: unknown): value is PageTemplateEntry => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.id !== 'string') return false
  if (typeof candidate.name !== 'string') return false
  if (typeof candidate.createdAt !== 'string') return false
  const page = candidate.page
  if (typeof page !== 'object' || page === null) return false
  const pageRecord = page as Record<string, unknown>
  return typeof pageRecord.id === 'string' && Array.isArray(pageRecord.widgets)
}

export const readTemplates = (): PageTemplateEntry[] => {
  const raw = readItem(PAGE_TEMPLATES_KEY)
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isEntry)
}

export const writeTemplates = (templates: PageTemplateEntry[]): boolean =>
  writeItem(PAGE_TEMPLATES_KEY, JSON.stringify(templates))
