import { useState } from 'react'
import type { PageConfig } from '@canshift/core'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../../stores/dashboard.store'
import { UiIcon } from '../icons/UiIcons'
import { StatusRowSheet } from './StatusRowSheet'

export interface PageMenuProps {
  pages: readonly PageConfig[]
  current: PageConfig
}

const MIN_PAGES = 1

const TemplateItem = ({ page }: { page: PageConfig }) => {
  const setPageTemplate = useDashboardStore((s) => s.setPageTemplate)
  const cruise = page.template === 'cruise_control'
  return (
    <DropdownMenuItem
      onSelect={() => setPageTemplate(page.id, cruise ? 'custom' : 'cruise_control')}
    >
      {cruise ? STRINGS.gauges.customPage : STRINGS.gauges.cruisePage}
    </DropdownMenuItem>
  )
}

interface PageMenuItemsProps extends PageMenuProps {
  onEditStatusRow: () => void
}

const PageMenuItems = ({ pages, current, onEditStatusRow }: PageMenuItemsProps) => {
  const movePage = useDashboardStore((s) => s.movePage)
  const removePage = useDashboardStore((s) => s.removePage)
  const index = pages.findIndex((page) => page.id === current.id)
  return (
    <DropdownMenuContent align="start">
      <DropdownMenuItem disabled={index <= 0} onSelect={() => movePage(index, index - 1)}>
        {STRINGS.gauges.moveEarlier}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={index >= pages.length - 1}
        onSelect={() => movePage(index, index + 1)}
      >
        {STRINGS.gauges.moveLater}
      </DropdownMenuItem>
      <TemplateItem page={current} />
      <DropdownMenuItem onSelect={onEditStatusRow}>{STRINGS.statusRow.menuItem}</DropdownMenuItem>
      <DropdownMenuItem
        disabled={pages.length <= MIN_PAGES}
        onSelect={() => removePage(current.id)}
        className="text-[#ff6b6b]"
      >
        {STRINGS.gauges.removePage}
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export const PageMenu = (props: PageMenuProps) => {
  const [statusRowOpen, setStatusRowOpen] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={STRINGS.gauges.pageOptions}
          className="grid size-11 shrink-0 place-items-center rounded-control border border-app-border bg-app-surface text-app-text"
        >
          <UiIcon name="chevronDown" />
        </DropdownMenuTrigger>
        <PageMenuItems
          {...props}
          onEditStatusRow={() => {
            setStatusRowOpen(true)
          }}
        />
      </DropdownMenu>
      <StatusRowSheet page={props.current} open={statusRowOpen} onOpenChange={setStatusRowOpen} />
    </>
  )
}
