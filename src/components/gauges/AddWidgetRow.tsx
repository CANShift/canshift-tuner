import type { PageConfig } from '@canshift/core'
import { FIRMWARE_CAPS } from '@canshift/core'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STRINGS } from '../../strings'
import { canAddGauge, freePlaceFor } from '../../lib/gauges/layouts'
import { buildWidget, PALETTE_ITEMS, type PaletteItem } from '../../lib/new-widget'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useBoardLacksImu } from '../../hooks/useBoardLacksImu'
import { UiIcon } from '../icons/UiIcons'

const addWidget = (page: PageConfig, item: PaletteItem): void => {
  const place = freePlaceFor(page, { colSpan: item.defaultColSpan, rowSpan: item.defaultRowSpan })
  if (place === null) return
  const widget = buildWidget(item)
  widget.layout = { ...widget.layout, ...place }
  useDashboardStore.getState().selectWidget(null)
  useDashboardStore.getState().addWidget(page.id, widget)
}

const PaletteEntry = ({ page, item }: { page: PageConfig; item: PaletteItem }) => {
  const lacksImu = useBoardLacksImu()
  const unavailable = item.needsImu === true && lacksImu
  return (
    <DropdownMenuItem disabled={unavailable} onSelect={() => addWidget(page, item)}>
      {item.label}
      {unavailable && <span className="ml-auto text-app-muted">{STRINGS.gauges.needsImu}</span>}
    </DropdownMenuItem>
  )
}

const AddMenu = ({ page }: { page: PageConfig }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild disabled={!canAddGauge(page)}>
      <Button variant="secondary">
        <UiIcon name="plus" />
        {STRINGS.gauges.add}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" aria-label={STRINGS.gauges.addWhat}>
      {PALETTE_ITEMS.map((item) => (
        <PaletteEntry key={item.type} page={page} item={item} />
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

export const AddWidgetRow = ({ page }: { page: PageConfig }) => (
  <div className="flex flex-wrap items-center gap-2">
    <AddMenu page={page} />
    <span className="text-sm text-app-muted">
      {canAddGauge(page)
        ? STRINGS.gauges.placesUsed(page.widgets.length, FIRMWARE_CAPS.MAX_WIDGETS_PER_PAGE)
        : STRINGS.gauges.pageFull}
    </span>
  </div>
)
