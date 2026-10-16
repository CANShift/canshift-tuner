import type { PageConfig } from '@canshift/core'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import { pageName } from '../../lib/sync/describe'
import { useDashboardStore } from '../../stores/dashboard.store'
import { UiIcon } from '../icons/UiIcons'
import { PageMenu } from './PageMenu'
import { canAddPage } from '../../lib/gauges/layouts'

export interface PageChipsProps {
  pages: readonly PageConfig[]
  current: PageConfig
  onAddPage: () => void
}

const AddPageButton = ({ pages, onAddPage }: Pick<PageChipsProps, 'pages' | 'onAddPage'>) => (
  <button
    type="button"
    disabled={!canAddPage(pages)}
    onClick={onAddPage}
    className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-control border border-dashed border-[#3a3f46] px-3.5 text-[15px] text-app-text disabled:opacity-50"
  >
    <UiIcon name="plus" />
    <span className="max-lg:sr-only">{STRINGS.gauges.addPage}</span>
  </button>
)

export const PageChips = ({ pages, current, onAddPage }: PageChipsProps) => {
  const selectPage = useDashboardStore((s) => s.selectPage)
  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
      <ToggleGroup
        type="single"
        value={current.id}
        onValueChange={(pageId) => {
          if (pageId.length > 0) selectPage(pageId)
        }}
        className="shrink-0 lg:flex-wrap"
      >
        {pages.map((page) => (
          <ToggleGroupItem key={page.id} value={page.id}>
            {pageName(page)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <PageMenu pages={pages} current={current} />
      <AddPageButton pages={pages} onAddPage={onAddPage} />
    </div>
  )
}
