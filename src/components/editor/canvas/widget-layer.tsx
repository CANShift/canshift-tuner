import type { PageConfig, PagePalette, PageTemplate, Widget } from '@canshift/core'
import { CruiseControlPreview } from '../CruiseControlPreview'
import { WidgetBox } from '../WidgetBox'

export interface WidgetLayerProps {
  page: PageConfig
  palette: PagePalette
  effScale: number
  canvasW: number
  areaWidth: number
  areaHeight: number
  selectedWidgetId: string | null
  selectedWidgetIds: string[]
  overlappingIds: ReadonlySet<string>
  overflowingIds: ReadonlySet<string>
  revLimiting: boolean
  flashWidgetId: string | null
  onSelect: (widgetId: string) => void
  onShiftSelect: (widgetId: string) => void
  onDragStart: (e: React.MouseEvent, widget: Widget) => void
  onResizeStart?: ((e: React.PointerEvent, widget: Widget) => void) | undefined
  onSignalDrop: (widget: Widget, signalName: string) => void
}

const warningsLast = (widgets: readonly Widget[]): Widget[] => [
  ...widgets.filter((w) => w.type !== 'warning'),
  ...widgets.filter((w) => w.type === 'warning'),
]

const CustomBody = (props: WidgetLayerProps) => (
  <>
    {warningsLast(props.page.widgets).map((widget) => (
      <WidgetBox
        key={widget.id}
        widget={widget}
        palette={props.palette}
        scale={props.effScale}
        areaWidth={props.areaWidth}
        areaHeight={props.areaHeight}
        isSelected={widget.id === props.selectedWidgetId}
        isInMultiSelection={
          props.selectedWidgetIds.length > 1 && props.selectedWidgetIds.includes(widget.id)
        }
        isOverlapping={props.overlappingIds.has(widget.id)}
        isOverflowing={props.overflowingIds.has(widget.id)}
        revLimiting={props.revLimiting}
        onSelect={props.onSelect}
        onShiftSelect={props.onShiftSelect}
        onDragStart={props.onDragStart}
        onResizeStart={props.onResizeStart}
        isFlashing={widget.id === props.flashWidgetId}
        onSignalDrop={props.onSignalDrop}
      />
    ))}
  </>
)

const CruiseControlBody = (props: WidgetLayerProps) => (
  <CruiseControlPreview
    scale={props.effScale}
    canvasW={props.canvasW}
    contentH={props.areaHeight * props.effScale}
    palette={props.palette}
  />
)

const TEMPLATE_BODIES: Record<PageTemplate, (props: WidgetLayerProps) => React.JSX.Element> = {
  custom: CustomBody,
  cruise_control: CruiseControlBody,
}

export const WidgetLayer = (props: WidgetLayerProps) => {
  const Body = TEMPLATE_BODIES[props.page.template ?? 'custom']
  return <Body {...props} />
}
