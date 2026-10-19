import { useState, type ComponentType } from 'react'
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
import { CarPagesPicker } from './CarPagesPicker'

export interface AddPageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SheetView = 'start' | 'car'

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

const BuildFromCarButton = ({ onOpen }: { onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex min-h-[60px] items-center gap-3 rounded-[12px] border border-app-accent bg-app-bg px-3.5 py-2 text-left"
  >
    <UiIcon name="car" className="text-app-accent" />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[15px] font-semibold">{STRINGS.gauges.buildFromCar}</span>
      <span className="text-[13px] text-app-muted">{STRINGS.gauges.buildFromCarSub}</span>
    </span>
    <UiIcon name="chevronRight" className="text-app-muted" />
  </button>
)

interface ViewProps {
  pick: (add: () => void) => () => void
  onView: (view: SheetView) => void
  onClose: () => void
}

const StartView = ({ pick, onView }: ViewProps) => (
  <>
    <SheetTitle className="text-[21px] font-bold lg:text-lg">{STRINGS.gauges.addPage}</SheetTitle>
    <BuildFromCarButton onOpen={() => onView('car')} />
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
  </>
)

const CarView = ({ onView, onClose }: ViewProps) => (
  <CarPagesPicker onBack={() => onView('start')} onAdded={onClose} />
)

const VIEWS: Record<SheetView, ComponentType<ViewProps>> = {
  start: StartView,
  car: CarView,
}

export const AddPageSheet = ({ open, onOpenChange }: AddPageSheetProps) => {
  const [view, setView] = useState<SheetView>('start')
  const changeOpen = (next: boolean) => {
    if (!next) setView('start')
    onOpenChange(next)
  }
  const pick = (add: () => void) => () => {
    add()
    changeOpen(false)
  }
  const View = VIEWS[view]
  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetContent>
        <View pick={pick} onView={setView} onClose={() => changeOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
