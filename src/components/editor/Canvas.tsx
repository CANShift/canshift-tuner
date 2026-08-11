import { useRef, useCallback, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { resolveGridRect, resolveScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { unboundWidgetCount } from '../../utils/unbound-widgets'
import { overflowingWidgetIds, overlappingWidgetIds } from '../../utils/widget-diagnostics'
import { useRebindFlashStore } from '../../stores/rebind-flash.store'
import ScreenSettingsPanel from './ScreenSettingsPanel'
import DiagnosticsPanel from './DiagnosticsPanel'
import { DashTopBar } from './DashTopBar'
import { CanvasToolbar } from './CanvasToolbar'
import { RevLimiterOverlay } from './RevLimiterOverlay'
import { ShortcutsDialog } from './ShortcutsDialog'
import { GridGuides } from './canvas/grid-guides'
import { WidgetLayer } from './canvas/widget-layer'
import { RubberBandRect } from './canvas/rubber-band-rect'
import { CanvasStatusBar } from './canvas/canvas-status-bar'
import { useDragState } from '../../hooks/useDragState'
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard'
import { useCanvasSignalDrop } from '../../hooks/useCanvasSignalDrop'
import { useClipboardWidgets } from '../../hooks/useClipboardWidgets'
import { useRubberBandSelection } from '../../hooks/useRubberBandSelection'
import { useRevLimiterFlash } from '../../hooks/useRevLimiterFlash'
import { useSwipeGestures } from '../../hooks/useSwipeGestures'
import { useEffectivePalette } from '../../hooks/useEffectivePalette'
import { useCanvasDialogs } from '../../hooks/useCanvasDialogs'

import { MONO_FONT } from '../../lib/typography'

const SCALE = 1.5
const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2] as const

const EMPTY_PAGES: readonly PageConfig[] = []

interface CanvasProps {
  page: PageConfig
  topBar: TopBarConfig
  pageIndex?: number | undefined
  pageStrip?: ReactNode
  inspector?: ReactNode
}

const Canvas = ({ page, topBar, pageIndex, pageStrip, inspector }: CanvasProps) => {
  const targetProfileId = useDashboardStore((s) => s.config?.targetProfile)
  const screenProfile = useMemo(() => resolveScreenProfile(targetProfileId), [targetProfileId])
  const [zoom, setZoom] = useState(1)
  const effScale = SCALE * zoom
  const canvasW = screenProfile.width * effScale
  const canvasH = screenProfile.height * effScale

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
  const undo = useDashboardStore((s) => s.undo)
  const redo = useDashboardStore((s) => s.redo)
  const canUndo = useDashboardStore((s) => s.past.length > 0)
  const undoLabel = useDashboardStore((s) => s.past[s.past.length - 1]?.label)
  const redoLabel = useDashboardStore((s) => s.future[0]?.label)
  const canRedo = useDashboardStore((s) => s.future.length > 0)

  const pages = useDashboardStore((s) => s.config?.pages ?? EMPTY_PAGES)

  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<number>(1)
  zoomRef.current = zoom

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

  const {
    isDayMode: activeDayMode,
    palette: effectivePalette,
    bgColor: effectiveBgColor,
  } = useEffectivePalette(page)

  const { settingsOpen, diagOpen, shortcutsOpen, setSettingsOpen, setDiagOpen, setShortcutsOpen } =
    useCanvasDialogs()

  const { revLimiting, flashPhase, startRevLimiter } = useRevLimiterFlash()

  const stepZoom = useCallback((dir: 1 | -1) => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z as (typeof ZOOM_STEPS)[number])
      const base = idx === -1 ? ZOOM_STEPS.indexOf(1) : idx
      const next = ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, base + dir))]
      return next ?? z
    })
  }, [])

  const overlappingIds = useMemo(() => overlappingWidgetIds(page.widgets), [page.widgets])
  const overflowingIds = useMemo(() => overflowingWidgetIds(page.widgets), [page.widgets])

  useCanvasKeyboard({
    selectWidget,
    selectWidgets,
    removeWidgets,
    nudgeWidgets,
    kbdRef,
    setShortcutsOpen,
  })

  useClipboardWidgets({ copyWidgets, removeWidgets, pasteWidgets })

  const handleDragStart = useDragState({ dragInputsRef, zoomRef, scale: SCALE })

  const { rubberBand, startRubberBand } = useRubberBandSelection({
    containerRef,
    effScale,
    pageId: page.id,
    selectWidgets,
  })

  const { onPointerDown, onPointerUp } = useSwipeGestures({
    containerRef,
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

  const unboundCount = useDashboardStore((s) => unboundWidgetCount(s.config))
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
    ? resolveGridRect(selectedWidget.layout, {
        width: screenProfile.width,
        height: widgetAreaH,
      })
    : null

  const deselectOnBackground = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-widget]') === null) selectWidget(null)
  }

  const handleZoomWheel = (e: React.WheelEvent) => {
    if (!e.metaKey && !e.ctrlKey) return
    e.preventDefault()
    stepZoom(e.deltaY < 0 ? 1 : -1)
  }

  const toolbarProps = {
    pageId: page.id,
    selectedWidgetIds,
    screenWidth: screenProfile.width,
    screenHeight: screenProfile.height,
    overflowingCount: overflowingIds.size,
    overflowingNames: page.widgets
      .filter((w) => overflowingIds.has(w.id))
      .map((w) => (w.signal ? `${w.type}.${w.signal}` : w.type)),
    unboundCount,
    canUndo,
    undoLabel,
    redoLabel,
    canRedo,
    onUndo: undo,
    onRedo: redo,
    zoom,
    onZoomIn: () => {
      stepZoom(1)
    },
    onZoomOut: () => {
      stepZoom(-1)
    },
    onZoomReset: () => {
      setZoom(1)
    },
    onOpenShortcuts: () => {
      setShortcutsOpen(true)
    },
    revLimiting,
    onStartRevLimiter: startRevLimiter,
  }

  const widgetLayerProps = {
    page,
    palette: effectivePalette,
    effScale,
    canvasW,
    areaWidth: screenProfile.width,
    areaHeight: widgetAreaH,
    selectedWidgetId,
    selectedWidgetIds,
    overlappingIds,
    overflowingIds,
    revLimiting,
    flashWidgetId,
    onSelect: selectWidget,
    onShiftSelect: toggleWidgetSelection,
    onDragStart: handleDragStart,
    onSignalDrop: handleWidgetSignalDrop,
  }

  return (
    <div style={rootStyle}>
      <CanvasToolbar {...toolbarProps} />
      {pageStrip}
      <div style={bodyRowStyle}>
        <div style={editorColStyle}>
          <div onMouseDown={deselectOnBackground} style={canvasZoneStyle}>
            <div style={frameColumnStyle}>
              <CanvasTitle pageIndex={pageIndex} screenProfile={screenProfile} zoom={zoom} />
              <div style={deviceFrameStyle}>
                <div style={screenStyle(canvasW, canvasH, effectiveBgColor)}>
                  {page.showTopBar !== false && (
                    <DashTopBar
                      topBar={topBar}
                      scale={effScale}
                      settingsOpen={settingsOpen}
                      isDayMode={activeDayMode}
                      onOpenSettings={() => {
                        setSettingsOpen((o) => !o)
                      }}
                    />
                  )}
                  <div
                    ref={containerRef}
                    onWheel={handleZoomWheel}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onDragOver={handleSignalDragOver}
                    onDrop={handleSignalDrop}
                    style={surfaceStyle}
                  >
                    <GridGuides
                      areaWidth={screenProfile.width}
                      areaHeight={widgetAreaH}
                      effScale={effScale}
                    />
                    <WidgetLayer {...widgetLayerProps} />
                    <RubberBandRect rubberBand={rubberBand} effScale={effScale} />
                    {settingsOpen && <ScreenSettingsPanel scale={effScale} />}
                    {diagOpen && <DiagnosticsPanel scale={effScale} />}
                    {revLimiting && (
                      <RevLimiterOverlay canvasW={canvasW} flashPhase={flashPhase} scale={SCALE} />
                    )}
                  </div>
                </div>
              </div>
            </div>
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

interface CanvasTitleProps {
  pageIndex: number | undefined
  screenProfile: { width: number; height: number }
  zoom: number
}

const CanvasTitle = ({ pageIndex, screenProfile, zoom }: CanvasTitleProps) => (
  <div style={canvasTitleRowStyle}>
    <span style={canvasTitleStyle}>
      {pageIndex !== undefined ? `PAGE ${String(pageIndex + 1)}` : 'PAGE'}
    </span>
    <span style={canvasDimsStyle}>
      {screenProfile.width} × {screenProfile.height} @ {SCALE * zoom}×
    </span>
  </div>
)

const rootStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
}

const bodyRowStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  minHeight: 0,
}

const editorColStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
}

const frameColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const screenStyle = (width: number, height: number, background: string): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  width,
  height,
  background,
  overflow: 'hidden',
})

const surfaceStyle: CSSProperties = {
  position: 'relative',
  flex: 1,
  overflow: 'hidden',
  cursor: 'default',
}

const canvasZoneStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  backgroundColor: 'hsl(var(--brand-neutral-100))',
  backgroundImage:
    'linear-gradient(hsl(var(--brand-neutral-200)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-neutral-200)) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
}

const canvasTitleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 10,
}

const canvasTitleStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'hsl(var(--brand-neutral-600))',
}

const canvasDimsStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
}

const deviceFrameStyle: CSSProperties = {
  border: '2px solid hsl(var(--brand-neutral-400))',
}

export default Canvas
