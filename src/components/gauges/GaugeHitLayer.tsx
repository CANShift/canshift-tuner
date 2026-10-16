import type { PageConfig, Widget } from '@canshift/core'
import { resolveGridRect } from '@canshift/core'
import { cn } from '@/lib/utils'
import { widgetName } from '../../lib/sync/describe'

export interface GaugeHitLayerProps {
  page: PageConfig
  scale: number
  top: number
  areaWidth: number
  areaHeight: number
  selectedId: string | null
  onSelect: (widgetId: string) => void
}

interface HitAreaProps extends Omit<GaugeHitLayerProps, 'page' | 'top'> {
  widget: Widget
}

const HitArea = ({ widget, scale, areaWidth, areaHeight, selectedId, onSelect }: HitAreaProps) => {
  const rect = resolveGridRect(widget.layout, { width: areaWidth, height: areaHeight })
  return (
    <button
      type="button"
      aria-label={widgetName(widget)}
      aria-pressed={widget.id === selectedId}
      onClick={() => {
        onSelect(widget.id)
      }}
      className={cn(
        'absolute rounded-[4px] bg-transparent focus-visible:outline-2',
        widget.id === selectedId && 'outline outline-2 outline-app-text lg:outline-[3px]'
      )}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        left: rect.x * scale,
        top: rect.y * scale,
        width: rect.w * scale,
        height: rect.h * scale,
      }}
    />
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
