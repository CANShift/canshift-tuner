import { describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'
import { instantiateTemplate } from './page-template'
import type { PageTemplateEntry } from '../stores/template/storage'

const sampleEntry = (): PageTemplateEntry => {
  const page = DEFAULT_SIM_CONFIG.pages[0]
  if (!page) throw new Error('sim config has no pages')
  return {
    id: 't1',
    name: 'Street',
    createdAt: '2026-01-01T00:00:00.000Z',
    page: structuredClone(page),
  }
}

describe('instantiateTemplate', () => {
  it('gives a fresh page id and fresh widget ids while preserving every binding', () => {
    const entry = sampleEntry()
    const page = instantiateTemplate(entry)

    expect(page.id).not.toBe(entry.page.id)
    expect(page.widgets.length).toBe(entry.page.widgets.length)

    page.widgets.forEach((widget, index) => {
      const source = entry.page.widgets[index]
      expect(widget.id).not.toBe(source?.id)
      expect({ ...widget, id: '' }).toEqual({ ...source, id: '' })
    })
  })

  it('does not mutate the stored template', () => {
    const entry = sampleEntry()
    const originalId = entry.page.id
    instantiateTemplate(entry)
    expect(entry.page.id).toBe(originalId)
  })
})
