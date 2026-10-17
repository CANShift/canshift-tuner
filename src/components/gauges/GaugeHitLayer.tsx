import type { CSSProperties, MouseEvent } from 'react'
import type { PageConfig, Widget } from '@canshift/core'
import { resolveGridRect } from '@canshift/core'
import { cn } from '@/lib/utils'
import { STRINGS } from '../../strings'
import { widgetName } from '../../lib/sync/describe'
import type { GaugeManipulation } from '../../hooks/useGaugeManipulation'

export interface GaugeHitLayerProps {
  page: PageConfig
  scale: number
  top: number
  areaWidth: number
  areaHeight: number
  selectedId: string | null
  selectedIds: readonly string[]
  manipulation: GaugeManipulation | null
  onSelect: (widgetId: string) => void
}

interface HitAreaProps extends Omit<GaugeHitLayerProps, 'page' | 'top'> {
  widget: Widget
}

const RING = {
  primary: 'outline outline-2 outline-app-text lg:outline-[3px]',
  member: 'outline-dashed outline-2 outline-app-text',
  none: '',
} as const

const ringOf = ({ widget, selectedId, selectedIds }: HitAreaProps): keyof typeof RING => {
  if (widget.id === selectedId) return 'primary'
  return selectedIds.length > 1 && selectedIds.includes(widget.id) ? 'member' : 'none'
}

const ResizeHandle = ({ widget, manipulation }: Pick<HitAreaProps, 'widget' | 'manipulation'>) => (
  <span
    aria-hidden="true"
    title={STRINGS.gauges.resizeHandle(widgetName(widget))}
    onPointerDown={(event) => {
      manipulation?.onResizeStart(event, widget)
    }}
    className="absolute -right-1.5 top-1/2 h-6 w-3 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-app-bg bg-app-text"
  />
)

const rectStyle = ({ widget, scale, areaWidth, areaHeight }: HitAreaProps): CSSProperties => {
  const rect = resolveGridRect(widget.layout, { width: areaWidth, height: areaHeight })
  return {
    left: rect.x * scale,
    top: rect.y * scale,
    width: rect.w * scale,
    height: rect.h * scale,
  }
}

const HitArea = (props: HitAreaProps) => {
  const { widget, manipulation, onSelect } = props
  const ring = ringOf(props)
  return (
    <button
      type="button"
      aria-label={widgetName(widget)}
      aria-pressed={ring !== 'none'}
      onMouseDown={(event) => manipulation?.onPress(event, widget)}
      onClick={(event: MouseEvent) => {
        if (manipulation === null || event.detail === 0) onSelect(widget.id)
      }}
      className={cn(
        'absolute rounded-[4px] bg-transparent focus-visible:outline-2',
        manipulation !== null && 'cursor-grab active:cursor-grabbing',
        RING[ring]
      )}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={rectStyle(props)}
    >
      {ring === 'primary' && manipulation !== null && (
        <ResizeHandle widget={widget} manipulation={manipulation} />
      )}
    </button>
  )
}

export const GaugeHitLayer = ({ page, top, ...area }: GaugeHitLayerProps) => (
  <div
    className="absolute inset-x-0 bottom-0"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ top }}
  >
    {page.widgets.map((widget) => (
      <HitArea key={widget.id} widget={widget} {...area} />
    ))}
  </div>
)
