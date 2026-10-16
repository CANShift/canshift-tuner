import { useState } from 'react'
import type { PageConfig, TopBarConfig, Widget } from '@canshift/core'
import { STRINGS } from '../../strings'
import { useConnection } from '../../hooks/useConnection'
import { useGaugeKeys } from '../../hooks/useGaugeKeys'
import { useGaugesPage } from '../../hooks/useGaugesPage'
import { useIsLaptop } from '../../hooks/useIsLaptop'
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
  if (connection !== 'connected')
    return <p className="text-[13px] text-app-muted">{STRINGS.gauges.paused}</p>
  if (selected) return null
  return <p className="text-[13px] text-app-muted">{STRINGS.gauges.hint}</p>
}

interface PreviewColumnProps {
  page: PageConfig
  topBar: TopBarConfig
  selectedId: string | null
}

const PreviewColumn = ({ page, topBar, selectedId }: PreviewColumnProps) => {
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  const [mode, setMode] = useState<PreviewMode>('normal')
  return (
    <div className="flex flex-col items-center gap-3 lg:items-start">
      <GaugePreview
        page={page}
        topBar={topBar}
        selectedId={selectedId}
        mode={mode}
        onSelect={selectWidget}
      />
      <PreviewHint selected={selectedId !== null} />
      <AddWidgetRow page={page} />
      <PreviewModeRow mode={mode} onMode={setMode} />
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

const SidePanel = ({ page, selected }: { page: PageConfig; selected: Widget | null }) => {
  const carChosen = useSignalStore((s) => s.carChosen)
  if (selected !== null) return <GaugeEditor page={page} widget={selected} />
  if (carChosen) return null
  return (
    <div className="px-4 lg:contents">
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
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4 lg:px-8 lg:py-6">
      <FirstOpenTop />
      <div className="px-4 lg:px-0">
        <PageChips pages={pages} current={page} onAddPage={openAdd} />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-8">
        <PreviewColumn page={page} topBar={topBar} selectedId={selected?.id ?? null} />
        <SidePanel page={page} selected={selected} />
      </div>
      {sheet}
    </div>
  )
}

export default GaugesSection
