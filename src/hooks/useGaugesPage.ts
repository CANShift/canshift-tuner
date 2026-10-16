import type { PageConfig, Widget } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'

export interface GaugesPage {
  pages: readonly PageConfig[]
  page: PageConfig | null
  selected: Widget | null
}

const NO_PAGES: readonly PageConfig[] = []

export const useGaugesPage = (): GaugesPage => {
  const pages = useDashboardStore((s) => s.config?.pages) ?? NO_PAGES
  const selectedPageId = useDashboardStore((s) => s.selectedPageId)
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  const page = pages.find((p) => p.id === selectedPageId) ?? pages[0] ?? null
  const selected = page?.widgets.find((w) => w.id === selectedWidgetId) ?? null
  return { pages, page, selected }
}
