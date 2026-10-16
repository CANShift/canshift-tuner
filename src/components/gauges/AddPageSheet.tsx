import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import {
  STARTING_LAYOUTS,
  buildBlankPage,
  nextPageId,
  pageFromLayout,
  type StartingLayout,
} from '../../lib/gauges/layouts'
import { useDashboardStore } from '../../stores/dashboard.store'
import { UiIcon } from '../icons/UiIcons'

export interface AddPageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROW =
  'flex min-h-[52px] w-full items-center gap-3 border-b border-app-divider px-3.5 py-2 text-left last:border-b-0'

const takenIds = (): Set<string> =>
  new Set(useDashboardStore.getState().config?.pages.map((page) => page.id) ?? [])

const addBlank = (): void => {
  const page = buildBlankPage()
  useDashboardStore.getState().addPage({ ...page, id: nextPageId('page', takenIds()) })
}

const addFromLayout = (layout: StartingLayout): void => {
  useDashboardStore.getState().addPage(pageFromLayout(layout, takenIds()))
}

const LayoutRow = ({ layout, onPick }: { layout: StartingLayout; onPick: () => void }) => (
  <li>
    <button type="button" className={ROW} onClick={onPick}>
      <UiIcon name="gauges" className="text-app-accent" />
      <span className="flex-1 text-[15px]">{layout.name}</span>
      <span className="text-[13px] text-app-muted">
        {STRINGS.gauges.layoutGauges(layout.gaugeCount)}
      </span>
    </button>
  </li>
)

export const AddPageSheet = ({ open, onOpenChange }: AddPageSheetProps) => {
  const pick = (add: () => void) => () => {
    add()
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetTitle className="text-[21px] font-bold lg:text-lg">
          {STRINGS.gauges.addPage}
        </SheetTitle>
        <SheetDescription className="text-sm text-app-muted">
          {STRINGS.gauges.startFromLayout}
        </SheetDescription>
        <ul className="flex flex-col rounded-[12px] border border-app-border bg-app-bg">
          {STARTING_LAYOUTS.map((layout) => (
            <LayoutRow key={layout.id} layout={layout} onPick={pick(() => addFromLayout(layout))} />
          ))}
        </ul>
        <button
          type="button"
          className="h-12 rounded-control border border-dashed border-[#3a3f46] text-[15px]"
          onClick={pick(addBlank)}
        >
          {STRINGS.gauges.blankPage}
        </button>
      </SheetContent>
    </Sheet>
  )
}
