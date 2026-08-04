import type { PageConfig } from '@canshift/core'
import { createId } from '../utils/id'
import type { PageTemplateEntry } from '../stores/template/storage'

export const PAGE_TEMPLATE_NAME_MAX = 60

export const instantiateTemplate = (entry: PageTemplateEntry): PageConfig => {
  const source = structuredClone(entry.page)
  return {
    ...source,
    id: createId('page'),
    widgets: source.widgets.map((widget) => ({ ...widget, id: createId(widget.type) })),
  }
}
