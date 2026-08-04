import type { DashboardConfig, PageConfig, ScreenProfileId } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'

export const BLANK_PAGE_SET = 'blank'

export interface PageSetOption {
  id: string
  label: string
}

const prettify = (id: string): string => id.charAt(0).toUpperCase() + id.slice(1)

export const PAGE_SET_OPTIONS: PageSetOption[] = DEFAULT_SIM_CONFIG.pages.map((page) => ({
  id: page.id,
  label: prettify(page.id),
}))

export interface NewProjectOptions {
  name: string
  targetProfile: ScreenProfileId
  pageSetId: string
}

const emptyPage = (template: PageConfig): PageConfig => ({
  ...structuredClone(template),
  id: 'page-1',
  widgets: [],
})

export const buildNewProjectDashboard = (options: NewProjectOptions): DashboardConfig => {
  const base = structuredClone(DEFAULT_SIM_CONFIG)
  const template = base.pages[0]
  if (!template) throw new Error('default configuration has no pages')
  const chosen =
    options.pageSetId === BLANK_PAGE_SET
      ? emptyPage(template)
      : (base.pages.find((page) => page.id === options.pageSetId) ?? emptyPage(template))
  return {
    ...base,
    name: options.name,
    targetProfile: options.targetProfile,
    pages: [chosen],
    defaultPageId: chosen.id,
  }
}
