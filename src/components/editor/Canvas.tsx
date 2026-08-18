import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { resolveGridRect, resolveScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { overflowingWidgetIds, overlappingWidgetIds } from '../../utils/widget-diagnostics'
import { useRebindFlashStore } from '../../stores/rebind-flash.store'
import ScreenSettingsPanel from './ScreenSettingsPanel'
import DiagnosticsPanel from './DiagnosticsPanel'
import { BurnVerdictBand } from './BurnVerdictBand'
import { ImportNoticeBand } from './ImportNoticeBand'
import { BurnFailureNotice } from './BurnFailureNotice'
import { RevLimiterOverlay } from './RevLimiterOverlay'
import { ShortcutsDialog } from './ShortcutsDialog'
import { PageFrame } from './canvas/page-frame'
import { RubberBandRect } from './canvas/rubber-band-rect'
import { CanvasStatusBar } from './canvas/canvas-status-bar'
import { useDragState } from '../../hooks/useDragState'
import { useResizeState } from '../../hooks/useResizeState'
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard'
import { useCanvasSignalDrop } from '../../hooks/useCanvasSignalDrop'
import { useClipboardWidgets } from '../../hooks/useClipboardWidgets'
import { useRubberBandSelection } from '../../hooks/useRubberBandSelection'
import { useRevLimiterFlash } from '../../hooks/useRevLimiterFlash'
import { useSwipeGestures } from '../../hooks/useSwipeGestures'
import { useCarouselScale } from '../../hooks/useCarouselScale'
import { useCanvasDialogs } from '../../hooks/useCanvasDialogs'
import { resolveBgColor, resolvePalette } from '../../hooks/useEffectivePalette'
import { useActiveDayMode } from '../../hooks/useActiveDayMode'
import { useDisplayTier } from '../../hooks/useDisplayTier'
import { PreviewOverlay } from './preview/PreviewOverlay'
import type { PreviewMode } from './preview/preview-modes'

const THUMBNAIL_RATIO = 0.42
const STRIP_CHROME_PX = 66
const EMPTY_PAGES: readonly PageConfig[] = []

interface CanvasProps {
  page: PageConfig
  topBar: TopBarConfig
  toolbar?: ReactNode
  inspector?: ReactNode
  previewMode?: PreviewMode
  onPageContextMenu?: ((pageId: string, x: number, y: number) => void) | undefined
}

const Canvas = ({
  page,
  topBar,
  toolbar,
  inspector,
  previewMode = 'normal',
  onPageContextMenu,
}: CanvasProps) => {
  const targetProfileId = useDashboardStore((s) => s.config?.targetProfile)
  const screenProfile = useMemo(() => resolveScreenProfile(targetProfileId), [targetProfileId])
  const pages = useDashboardStore((s) => s.config?.pages ?? EMPTY_PAGES)
  const theme = useDashboardStore((s) => s.config?.theme)
  const isDayMode = useActiveDayMode()
  const tier = useDisplayTier()

  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  const selectedWidgetIds = useDashboardStore((s) => s.selectedWidgetIds)
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  const selectWidgets = useDashboardStore((s) => s.selectWidgets)
  const toggleWidgetSelection = useDashboardStore((s) => s.toggleWidgetSelection)
  const removeWidgets = useDashboardStore((s) => s.removeWidgets)
  const copyWidgets = useDashboardStore((s) => s.copyWidgets)
  const pasteWidgets = useDashboardStore((s) => s.pasteWidgets)
  const nudgeWidgets = useDashboardStore((s) => s.nudgeWidgets)
  const selectPage = useDashboardStore((s) => s.selectPage)

  const { stripRef, scale } = useCarouselScale(screenProfile.height, STRIP_CHROME_PX)
  const currentRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [page.id, pages.length, scale])

  const widgetAreaH =
    page.showTopBar !== false ? screenProfile.height - topBar.height : screenProfile.height

  const dragInputsRef = useRef({
    pageId: page.id,
    pageWidgets: page.widgets,
    selectedWidgetIds,
    canvasW: screenProfile.width,
    widgetAreaH,
  })
  dragInputsRef.current = {
    pageId: page.id,
    pageWidgets: page.widgets,
    selectedWidgetIds,
    canvasW: screenProfile.width,
    widgetAreaH,
  }

  const kbdRef = useRef({ pageId: page.id, pageWidgets: page.widgets })
  kbdRef.current = { pageId: page.id, pageWidgets: page.widgets }

  const { settingsOpen, diagOpen, shortcutsOpen, setSettingsOpen, setDiagOpen, setShortcutsOpen } =
    useCanvasDialogs()
  const { revLimiting, flashPhase, startRevLimiter } = useRevLimiterFlash()

  const overlappingIds = useMemo(() => overlappingWidgetIds(page.widgets), [page.widgets])
  const overflowingIds = useMemo(
    () => overflowingWidgetIds(page.widgets, tier),
    [page.widgets, tier]
  )

  useCanvasKeyboard({
    selectWidget,
    selectWidgets,
    removeWidgets,
    nudgeWidgets,
    kbdRef,
    setShortcutsOpen,
  })
  useClipboardWidgets({ copyWidgets, removeWidgets, pasteWidgets })

  const handleDragStart = useDragState({ dragInputsRef, zoomRef: scaleRef, scale: 1 })

  const resizeInputsRef = useRef({ pageId: page.id, canvasW: screenProfile.width })
  resizeInputsRef.current = { pageId: page.id, canvasW: screenProfile.width }
  const handleResizeStart = useResizeState({ inputsRef: resizeInputsRef, scaleRef })

  const { rubberBand, startRubberBand } = useRubberBandSelection({
    containerRef: surfaceRef,
    effScale: scale,
    pageId: page.id,
    selectWidgets,
  })

  const { onPointerDown, onPointerUp } = useSwipeGestures({
    containerRef: surfaceRef,
    pageId: page.id,
    pages,
    rubberBand,
    diagOpen,
    settingsOpen,
    setDiagOpen,
    selectWidget,
    selectPage,
    startRubberBand,
  })

  const flashWidgetId = useRebindFlashStore((s) => s.flashId)
  const templateLocked = (page.template ?? 'custom') !== 'custom'

  const { handleWidgetSignalDrop, handleSignalDragOver, handleSignalDrop } = useCanvasSignalDrop({
    pageId: page.id,
    pageWidgets: page.widgets,
    templateLocked,
  })

  const selectedWidget =
    selectedWidgetId !== null ? page.widgets.find((w) => w.id === selectedWidgetId) : undefined
  const selectedRect = selectedWidget
    ? resolveGridRect(selectedWidget.layout, { width: screenProfile.width, height: widgetAreaH })
    : null

  const interaction = {
    surfaceRef,
    surfaceProps: {
      onPointerDown,
      onPointerUp,
      onDragOver: handleSignalDragOver,
      onDrop: handleSignalDrop,
      onMouseDown: (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-widget]') === null) selectWidget(null)
      },
    },
    selectedWidgetId,
    selectedWidgetIds,
    overlappingIds,
    overflowingIds,
    flashWidgetId,
    onSelect: selectWidget,
    onShiftSelect: toggleWidgetSelection,
    onDragStart: handleDragStart,
    onResizeStart: handleResizeStart,
    onSignalDrop: handleWidgetSignalDrop,
    settingsOpen,
    overlay: (
      <>
        <RubberBandRect rubberBand={rubberBand} effScale={scale} />
        {settingsOpen && <ScreenSettingsPanel scale={scale} />}
        {diagOpen && <DiagnosticsPanel scale={scale} />}
        {revLimiting && (
          <RevLimiterOverlay
            canvasW={screenProfile.width * scale}
            flashPhase={flashPhase}
            scale={scale}
          />
        )}
        <PreviewOverlay
          mode={previewMode}
          scale={scale}
          bgColor={resolveBgColor(
            isDayMode,
            theme?.day.bgColor,
            theme?.night.bgColor,
            page.backgroundColor
          )}
          palette={resolvePalette(
            isDayMode,
            theme?.day.palette,
            theme?.night.palette,
            page.palette
          )}
        />
      </>
    ),
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {toolbar}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <BurnFailureNotice />
          <ImportNoticeBand />
          <BurnVerdictBand />
          <div ref={stripRef} className={STRIP}>
            {pages.map((candidate, index) => (
              <div
                key={candidate.id}
                ref={candidate.id === page.id ? currentRef : undefined}
                className="flex flex-none flex-col gap-2"
              >
                <div className={LABEL}>
                  <span className={candidate.id === page.id ? 'text-ui-ink' : 'text-ui-muted'}>
                    PAGE {index + 1}
                  </span>
                  {candidate.id === page.id && (
                    <button
                      type="button"
                      onClick={startRevLimiter}
                      disabled={revLimiting}
                      title="Preview the rev limiter for five seconds"
                      className="cursor-pointer border-0 bg-transparent p-0 font-mono text-[10px] tracking-[0.16em] text-ui-accent disabled:opacity-60"
                    >
                      REV LIMIT
                    </button>
                  )}
                </div>
                <PageWrapper
                  current={candidate.id === page.id}
                  onSelect={() => {
                    selectPage(candidate.id)
                  }}
                  onContextMenu={(e) => {
                    if (!onPageContextMenu) return
                    e.preventDefault()
                    onPageContextMenu(candidate.id, e.clientX, e.clientY)
                  }}
                >
                  <PageFrame
                    tracks={tier}
                    page={candidate}
                    topBar={topBar}
                    scale={candidate.id === page.id ? scale : scale * THUMBNAIL_RATIO}
                    palette={resolvePalette(
                      isDayMode,
                      theme?.day.palette,
                      theme?.night.palette,
                      candidate.palette
                    )}
                    bgColor={resolveBgColor(
                      isDayMode,
                      theme?.day.bgColor,
                      theme?.night.bgColor,
                      candidate.backgroundColor
                    )}
                    isDayMode={isDayMode}
                    areaWidth={screenProfile.width}
                    areaHeight={
                      candidate.showTopBar !== false
                        ? screenProfile.height - topBar.height
                        : screenProfile.height
                    }
                    screenHeight={screenProfile.height}
                    revLimiting={candidate.id === page.id && revLimiting}
                    interaction={candidate.id === page.id ? interaction : undefined}
                    onOpenSettings={
                      candidate.id === page.id
                        ? () => {
                            setSettingsOpen((open) => !open)
                          }
                        : undefined
                    }
                  />
                </PageWrapper>
              </div>
            ))}
          </div>
          <CanvasStatusBar
            page={page}
            selectedWidget={selectedWidget}
            selectedRect={selectedRect}
          />
        </div>
        {inspector}
      </div>
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  )
}

interface PageWrapperProps {
  current: boolean
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent) => void
  children: ReactNode
}

const PageWrapper = ({ current, onSelect, onContextMenu, children }: PageWrapperProps) => {
  if (current) {
    return (
      <div onContextMenu={onContextMenu} className="outline outline-2 outline-ui-accent">
        {children}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      onContextMenu={onContextMenu}
      title="Edit this page"
      className="cursor-pointer border-0 bg-transparent p-0 opacity-50 hover:opacity-100"
    >
      {children}
    </button>
  )
}

const STRIP = 'flex min-h-0 flex-1 items-center gap-[26px] overflow-auto bg-ui-panel px-6 py-5'

const LABEL = 'flex items-baseline justify-between gap-3 font-mono text-[10px] tracking-[0.18em]'

export default Canvas
