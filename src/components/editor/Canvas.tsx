import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { resolveGridRect, resolveScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { BurnVerdictBand } from './BurnVerdictBand'
import { ImportNoticeBand } from './ImportNoticeBand'
import { BurnFailureNotice } from './BurnFailureNotice'
import { ShortcutsDialog } from './ShortcutsDialog'
import { CanvasStatusBar } from './canvas/canvas-status-bar'
import { CanvasOverlay } from './canvas/canvas-overlay'
import { PageStrip, type CurrentPageControls, type ScreenSize } from './canvas/page-strip'
import { useCanvasEditing } from './canvas/use-canvas-editing'
import { useCanvasSurface } from './canvas/use-canvas-surface'
import { useCanvasInteraction } from './canvas/use-canvas-interaction'
import { useRevLimiterFlash } from '../../hooks/useRevLimiterFlash'
import { useCarouselScale } from '../../hooks/useCarouselScale'
import { useCanvasDialogs, type CanvasDialogs } from '../../hooks/useCanvasDialogs'
import { useDisplayTier } from '../../hooks/useDisplayTier'
import type { PreviewMode } from './preview/preview-modes'

const STRIP_CHROME_PX = 66
const EMPTY_PAGES: readonly PageConfig[] = []

const STRIP =
  'flex min-h-0 flex-1 items-center gap-[26px] overflow-auto bg-ui-panel px-3 py-5 font-sans md:px-6'

interface CanvasProps {
  page: PageConfig
  topBar: TopBarConfig
  toolbar?: ReactNode
  inspector?: ReactNode
  previewMode?: PreviewMode
  onPageContextMenu?: ((pageId: string, x: number, y: number) => void) | undefined
}

const useScreen = (): ScreenSize & { id: string } => {
  const targetProfileId = useDashboardStore((s) => s.config?.targetProfile)
  return useMemo(() => resolveScreenProfile(targetProfileId), [targetProfileId])
}

const widgetAreaHeight = (page: PageConfig, screen: ScreenSize, topBar: TopBarConfig): number =>
  page.showTopBar !== false ? screen.height - topBar.height : screen.height

interface ScrollKeys {
  pageId: string
  pageCount: number
  scale: number
}

const useScrollToCurrent = (
  ref: RefObject<HTMLDivElement | null>,
  { pageId, pageCount, scale }: ScrollKeys
) => {
  useEffect(() => {
    ref.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [ref, pageId, pageCount, scale])
}

interface SelectionStatusProps {
  page: PageConfig
  screen: ScreenSize
  areaHeight: number
}

const SelectionStatus = ({ page, screen, areaHeight }: SelectionStatusProps) => {
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  const selectedWidget =
    selectedWidgetId !== null ? page.widgets.find((w) => w.id === selectedWidgetId) : undefined
  const selectedRect = selectedWidget
    ? resolveGridRect(selectedWidget.layout, { width: screen.width, height: areaHeight })
    : null
  return <CanvasStatusBar page={page} selectedWidget={selectedWidget} selectedRect={selectedRect} />
}

const CanvasNotices = () => (
  <>
    <BurnFailureNotice />
    <ImportNoticeBand />
    <BurnVerdictBand />
  </>
)

interface StageInputs extends Pick<CanvasProps, 'page' | 'topBar' | 'onPageContextMenu'> {
  previewMode: PreviewMode
  dialogs: CanvasDialogs
}

const useStageGeometry = (page: PageConfig, topBar: TopBarConfig) => {
  const screen = useScreen()
  const pages = useDashboardStore((s) => s.config?.pages ?? EMPTY_PAGES)
  const tier = useDisplayTier()
  const { stripRef, scale } = useCarouselScale(screen, STRIP_CHROME_PX)
  const areaHeight = widgetAreaHeight(page, screen, topBar)
  return { screen, pages, tier, stripRef, scale, areaHeight }
}

type StageGeometry = ReturnType<typeof useStageGeometry>

const useStageInteraction = (inputs: StageInputs, geometry: StageGeometry) => {
  const { page, previewMode, dialogs } = inputs
  const { screen, pages, scale } = geometry
  const revLimiter = useRevLimiterFlash()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const area = { width: screen.width, widgetAreaHeight: geometry.areaHeight }
  const editing = useCanvasEditing(page, area, scale, dialogs)
  const surface = useCanvasSurface({ page, pages, surfaceRef, scale, dialogs })
  const overlayProps = { page, canvasWidth: screen.width, scale, previewMode, dialogs, revLimiter }
  const overlay = <CanvasOverlay {...overlayProps} rubberBand={surface.rubberBand} />
  const settingsOpen = dialogs.settingsOpen
  const interaction = useCanvasInteraction({
    page,
    tier: geometry.tier,
    surfaceRef,
    surface,
    editing,
    settingsOpen,
    overlay,
  })
  return { interaction, revLimiter }
}

const useCurrentControls = (inputs: StageInputs, geometry: StageGeometry): CurrentPageControls => {
  const { interaction, revLimiter } = useStageInteraction(inputs, geometry)
  return {
    interaction,
    revLimiting: revLimiter.revLimiting,
    onRevLimiter: revLimiter.startRevLimiter,
    onToggleSettings: () => inputs.dialogs.setSettingsOpen((open) => !open),
  }
}

interface StageStripProps extends Pick<StageInputs, 'page' | 'topBar' | 'onPageContextMenu'> {
  geometry: StageGeometry
  controls: CurrentPageControls
  currentRef: RefObject<HTMLDivElement | null>
}

const StageStrip = ({
  page,
  topBar,
  onPageContextMenu,
  geometry,
  controls,
  currentRef,
}: StageStripProps) => {
  const selectPage = useDashboardStore((s) => s.selectPage)
  return (
    <div ref={geometry.stripRef} className={STRIP}>
      <PageStrip
        pages={geometry.pages}
        currentPageId={page.id}
        currentControls={controls}
        currentRef={currentRef}
        onSelectPage={selectPage}
        onPageContextMenu={onPageContextMenu}
        topBar={topBar}
        tracks={geometry.tier}
        screen={geometry.screen}
        scale={geometry.scale}
      />
    </div>
  )
}

const CanvasStage = (inputs: StageInputs) => {
  const geometry = useStageGeometry(inputs.page, inputs.topBar)
  const controls = useCurrentControls(inputs, geometry)
  const currentRef = useRef<HTMLDivElement>(null)
  const scrollKeys = {
    pageId: inputs.page.id,
    pageCount: geometry.pages.length,
    scale: geometry.scale,
  }
  useScrollToCurrent(currentRef, scrollKeys)

  return (
    <div className="flex min-w-0 flex-col max-md:h-[calc(75vw+120px)] max-md:shrink-0 md:flex-1">
      <CanvasNotices />
      <StageStrip {...inputs} geometry={geometry} controls={controls} currentRef={currentRef} />
      <SelectionStatus
        page={inputs.page}
        screen={geometry.screen}
        areaHeight={geometry.areaHeight}
      />
    </div>
  )
}

const Canvas = ({
  page,
  topBar,
  toolbar,
  inspector,
  previewMode = 'normal',
  onPageContextMenu,
}: CanvasProps) => {
  const dialogs = useCanvasDialogs()
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {toolbar}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <CanvasStage
          page={page}
          topBar={topBar}
          previewMode={previewMode}
          dialogs={dialogs}
          onPageContextMenu={onPageContextMenu}
        />
        {inspector}
      </div>
      <ShortcutsDialog open={dialogs.shortcutsOpen} onOpenChange={dialogs.setShortcutsOpen} />
    </div>
  )
}

export default Canvas
