import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PageConfig, TopBarConfig, Widget } from '@canshift/core'
import { STRINGS } from '../../strings'
import { useConnection } from '../../hooks/useConnection'
import { useGaugeKeys } from '../../hooks/useGaugeKeys'
import { useGaugesPage } from '../../hooks/useGaugesPage'
import { useIsLaptop } from '../../hooks/useIsLaptop'
import { usePreviewScale } from '../../hooks/usePreviewScale'
import { useDashboardStore } from '../../stores/dashboard.store'
import { AddWidgetRow } from './AddWidgetRow'
import { AddPageSheet } from './AddPageSheet'
import { GaugeEditor } from './GaugeEditor'
import { GaugePreview } from './GaugePreview'
import { PreviewModeRow } from './PreviewModeRow'
import type { PreviewMode } from '../editor/preview/preview-modes'
import { PageChips } from './PageChips'
import { FirstOpenHeading, SetupCard } from './SetupCard'
import { useSignalStore } from '../../stores/signal.store'

const PreviewHint = ({ selected }: { selected: boolean }) => {
  const { connection } = useConnection()
  const isLaptop = useIsLaptop()
  if (connection !== 'connected')
    return <p className="text-[13px] text-app-muted">{STRINGS.gauges.paused}</p>
  if (selected) return null
  return (
    <p className="text-[13px] text-app-muted">
      {isLaptop ? STRINGS.gauges.hintLaptop : STRINGS.gauges.hint}
    </p>
  )
}

interface PreviewColumnProps {
  pages: readonly PageConfig[]
  page: PageConfig
  topBar: TopBarConfig
  selected: Widget | null
  onAddPage: () => void
}

const PreviewColumn = ({ pages, page, topBar, selected, onAddPage }: PreviewColumnProps) => {
  const selectedId = selected?.id ?? null
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  const [mode, setMode] = useState<PreviewMode>('normal')
  const { columnRef, scale } = usePreviewScale()
  return (
    <div ref={columnRef} className="flex min-w-0 flex-col lg:items-center">
      <div className="flex flex-col gap-4 lg:w-min lg:gap-3">
        <div className="px-4 lg:px-0">
          <PageChips pages={pages} current={page} onAddPage={onAddPage} />
        </div>
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <GaugePreview
            page={page}
            topBar={topBar}
            scale={scale}
            selectedId={selectedId}
            mode={mode}
            onSelect={selectWidget}
          />
          <PreviewHint selected={selectedId !== null} />
          <AddWidgetRow page={page} />
          <PreviewModeRow mode={mode} onMode={setMode} />
        </div>
      </div>
    </div>
  )
}

const EmptyGauges = ({ onAddPage }: { onAddPage: () => void }) => (
  <div className="flex flex-1 flex-col items-start gap-4 p-5">
    <p className="text-base text-app-secondary">{STRINGS.gauges.empty}</p>
    <button
      type="button"
      onClick={onAddPage}
      className="h-11 rounded-control border border-dashed border-[#3a3f46] px-4"
    >
      {STRINGS.gauges.addPage}
    </button>
  </div>
)

const SIDE_PANEL = 'lg:mx-auto lg:w-full lg:max-w-[480px] xl:mx-0 xl:max-w-none'

const SidePanel = ({ page, selected }: { page: PageConfig; selected: Widget | null }) => {
  const carChosen = useSignalStore((s) => s.carChosen)
  if (selected !== null)
    return (
      <div className={SIDE_PANEL}>
        <GaugeEditor page={page} widget={selected} />
      </div>
    )
  if (carChosen) return null
  return (
    <div className={cn('px-4 lg:px-0', SIDE_PANEL)}>
      <SetupCard />
    </div>
  )
}

const FirstOpenTop = () => {
  const carChosen = useSignalStore((s) => s.carChosen)
  if (carChosen) return null
  return (
    <div className="px-4 lg:px-0">
      <FirstOpenHeading />
    </div>
  )
}

const GAUGES_GRID = [
  'flex flex-col gap-4 xl:mx-auto xl:grid xl:w-full xl:max-w-[1120px] xl:items-start xl:gap-6',
  'xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px]',
].join(' ')

const GaugesSection = () => {
  const { pages, page, selected } = useGaugesPage()
  const topBar = useDashboardStore((s) => s.config?.topBar)
  const [adding, setAdding] = useState(false)
  useGaugeKeys(page, useIsLaptop())
  const openAdd = () => setAdding(true)
  const sheet = <AddPageSheet open={adding} onOpenChange={setAdding} />
  if (page === null || topBar === undefined)
    return (
      <>
        <EmptyGauges onAddPage={openAdd} />
        {sheet}
      </>
    )
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden pt-4 lg:px-6 lg:py-6">
      <FirstOpenTop />
      <div className={GAUGES_GRID}>
        <PreviewColumn {...{ pages, page, topBar, selected }} onAddPage={openAdd} />
        <SidePanel page={page} selected={selected} />
      </div>
      {sheet}
    </div>
  )
}

export default GaugesSection
