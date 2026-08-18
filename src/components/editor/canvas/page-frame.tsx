import type { HTMLAttributes, ReactNode, Ref } from 'react'
import type { PageConfig, PagePalette, TopBarConfig, Widget } from '@canshift/core'
import { DashTopBar } from '../DashTopBar'
import { GridGuides } from './grid-guides'
import { WidgetLayer } from './widget-layer'

const NO_IDS: ReadonlySet<string> = new Set()
const NO_SELECTION: string[] = []
const noop = () => {}

export interface PageFrameInteraction {
  surfaceRef: Ref<HTMLDivElement>
  surfaceProps: HTMLAttributes<HTMLDivElement>
  selectedWidgetId: string | null
  selectedWidgetIds: string[]
  overlappingIds: ReadonlySet<string>
  overflowingIds: ReadonlySet<string>
  flashWidgetId: string | null
  onSelect: (widgetId: string) => void
  onShiftSelect: (widgetId: string) => void
  onDragStart: (e: React.MouseEvent, widget: Widget) => void
  onResizeStart: (e: React.PointerEvent, widget: Widget) => void
  onSignalDrop: (widget: Widget, signalName: string) => void
  settingsOpen: boolean
  overlay: ReactNode
}

export interface PageFrameProps {
  page: PageConfig
  topBar: TopBarConfig
  scale: number
  palette: PagePalette
  bgColor: string
  isDayMode: boolean
  areaWidth: number
  areaHeight: number
  screenHeight: number
  revLimiting: boolean
  interaction?: PageFrameInteraction | undefined
  onOpenSettings?: (() => void) | undefined
}

export const PageFrame = ({
  page,
  topBar,
  scale,
  palette,
  bgColor,
  isDayMode,
  areaWidth,
  areaHeight,
  screenHeight,
  revLimiting,
  interaction,
  onOpenSettings,
}: PageFrameProps) => (
  <div
    className="flex flex-col overflow-hidden"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ width: areaWidth * scale, height: screenHeight * scale, background: bgColor }}
  >
    {page.showTopBar !== false && (
      <DashTopBar
        topBar={topBar}
        scale={scale}
        settingsOpen={interaction?.settingsOpen ?? false}
        isDayMode={isDayMode}
        onOpenSettings={onOpenSettings ?? noop}
      />
    )}
    <div
      ref={interaction?.surfaceRef}
      {...(interaction?.surfaceProps ?? {})}
      className="relative flex-1 cursor-default overflow-hidden"
    >
      <GridGuides areaWidth={areaWidth} areaHeight={areaHeight} effScale={scale} />
      <WidgetLayer
        groundColor={bgColor}
        page={page}
        palette={palette}
        effScale={scale}
        canvasW={areaWidth * scale}
        areaWidth={areaWidth}
        areaHeight={areaHeight}
        selectedWidgetId={interaction?.selectedWidgetId ?? null}
        selectedWidgetIds={interaction?.selectedWidgetIds ?? NO_SELECTION}
        overlappingIds={interaction?.overlappingIds ?? NO_IDS}
        overflowingIds={interaction?.overflowingIds ?? NO_IDS}
        revLimiting={revLimiting}
        flashWidgetId={interaction?.flashWidgetId ?? null}
        onSelect={interaction?.onSelect ?? noop}
        onShiftSelect={interaction?.onShiftSelect ?? noop}
        onDragStart={interaction?.onDragStart ?? noop}
        onResizeStart={interaction?.onResizeStart}
        onSignalDrop={interaction?.onSignalDrop ?? noop}
      />
      {interaction?.overlay}
    </div>
  </div>
)
