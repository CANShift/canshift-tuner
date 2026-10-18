import type { HTMLAttributes, ReactNode, Ref } from 'react'
import type { GridTracks, PageConfig, PagePalette, TopBarConfig, Widget } from '@canshift/core'
import { DashTopBar } from '../DashTopBar'
import { GridGuides } from './grid-guides'
import { WidgetLayer, type WidgetLayerProps } from './widget-layer'

const NO_IDS: ReadonlySet<string> = new Set()
const NO_SELECTION: string[] = []
const noop = () => {}

interface PageFrameInteraction {
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
  tracks: GridTracks
  isDayMode: boolean
  areaWidth: number
  areaHeight: number
  screenHeight: number
  revLimiting: boolean
  interaction?: PageFrameInteraction | undefined
  onOpenSettings?: (() => void) | undefined
}

type FrameInteraction = Omit<PageFrameInteraction, 'onResizeStart'> & {
  onResizeStart: PageFrameInteraction['onResizeStart'] | undefined
}

const IDLE: FrameInteraction = {
  surfaceRef: null,
  surfaceProps: {},
  selectedWidgetId: null,
  selectedWidgetIds: NO_SELECTION,
  overlappingIds: NO_IDS,
  overflowingIds: NO_IDS,
  flashWidgetId: null,
  onSelect: noop,
  onShiftSelect: noop,
  onDragStart: noop,
  onResizeStart: undefined,
  onSignalDrop: noop,
  settingsOpen: false,
  overlay: null,
}

type LayerInteraction = Pick<
  WidgetLayerProps,
  | 'selectedWidgetId'
  | 'selectedWidgetIds'
  | 'overlappingIds'
  | 'overflowingIds'
  | 'flashWidgetId'
  | 'onSelect'
  | 'onShiftSelect'
  | 'onDragStart'
  | 'onResizeStart'
  | 'onSignalDrop'
>

const layerInteraction = (interaction: FrameInteraction): LayerInteraction => ({
  selectedWidgetId: interaction.selectedWidgetId,
  selectedWidgetIds: interaction.selectedWidgetIds,
  overlappingIds: interaction.overlappingIds,
  overflowingIds: interaction.overflowingIds,
  flashWidgetId: interaction.flashWidgetId,
  onSelect: interaction.onSelect,
  onShiftSelect: interaction.onShiftSelect,
  onDragStart: interaction.onDragStart,
  onResizeStart: interaction.onResizeStart,
  onSignalDrop: interaction.onSignalDrop,
})

type SurfaceProps = Pick<
  PageFrameProps,
  'page' | 'scale' | 'palette' | 'bgColor' | 'tracks' | 'areaWidth' | 'areaHeight' | 'revLimiting'
> & { interaction: FrameInteraction }

const FrameSurface = ({ interaction, ...frame }: SurfaceProps) => (
  <div
    ref={interaction.surfaceRef}
    {...interaction.surfaceProps}
    className="relative flex-1 cursor-default overflow-hidden"
  >
    <GridGuides
      areaWidth={frame.areaWidth}
      areaHeight={frame.areaHeight}
      effScale={frame.scale}
      tracks={frame.tracks}
    />
    <WidgetLayer
      groundColor={frame.bgColor}
      page={frame.page}
      palette={frame.palette}
      effScale={frame.scale}
      canvasW={frame.areaWidth * frame.scale}
      areaWidth={frame.areaWidth}
      areaHeight={frame.areaHeight}
      revLimiting={frame.revLimiting}
      {...layerInteraction(interaction)}
    />
    {interaction.overlay}
  </div>
)

export const PageFrame = ({ interaction, onOpenSettings, ...frame }: PageFrameProps) => {
  const active = interaction ?? IDLE
  return (
    <div
      className="flex flex-col overflow-hidden"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        width: frame.areaWidth * frame.scale,
        height: frame.screenHeight * frame.scale,
        background: frame.bgColor,
      }}
    >
      {frame.page.showTopBar !== false && (
        <DashTopBar
          topBar={frame.topBar}
          statusRow={frame.page.statusRow}
          scale={frame.scale}
          settingsOpen={active.settingsOpen}
          isDayMode={frame.isDayMode}
          onOpenSettings={onOpenSettings ?? noop}
        />
      )}
      <FrameSurface interaction={active} {...frame} />
    </div>
  )
}
