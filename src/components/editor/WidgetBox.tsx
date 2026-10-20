import { memo, type CSSProperties, type DragEvent, type MouseEvent, type PointerEvent } from 'react'
import type { GridRect, PagePalette, Widget } from '@canshift/core'
import { resolvePageWidgetRect } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { WidgetPreview } from './WidgetPreview'
import { SIGNAL_CONSUMING_TYPES, SIGNAL_DRAG_MIME } from '../../utils/default-widget'

export interface WidgetBoxProps {
  widget: Widget
  palette: PagePalette
  scale: number
  areaWidth: number
  areaHeight: number
  hasShiftStrip: boolean
  isSelected: boolean
  isInMultiSelection: boolean
  isOverlapping: boolean
  isOverflowing: boolean
  isFlashing: boolean
  revLimiting: boolean
  onSelect: (id: string) => void
  onShiftSelect: (id: string) => void
  onDragStart: (e: MouseEvent, widget: Widget) => void
  onResizeStart?: ((e: PointerEvent, widget: Widget) => void) | undefined
  onSignalDrop: (widget: Widget, signalName: string) => void
  groundColor: string
}

const GRIP_WIDTH_PX = 12

type BoxFill = 'overlapping' | 'overflowing' | 'selected' | 'multi' | 'plain'
type BoxGlow = 'overlapping' | 'overflowing' | 'multi' | 'none'
type BoxRing = 'flashing' | 'selected' | 'none'

const box = cva('absolute box-border cursor-move select-none overflow-hidden', {
  variants: {
    fill: {
      overlapping: 'bg-[#2A0000]',
      overflowing: 'bg-[#2A1A00]',
      selected: 'bg-selection-bg',
      multi: 'bg-[#0A0A1E]',
      plain: 'bg-transparent',
    },
    glow: {
      overlapping: 'shadow-[0_0_0_1px_#FF222244,0_0_8px_#FF222288]',
      overflowing: 'shadow-[0_0_0_1px_#FF880044,0_0_8px_#FF880088]',
      multi: 'shadow-[0_0_0_1px_#AAAAFF22,0_0_4px_#AAAAFF44]',
      none: '',
    },
    ring: {
      flashing: 'outline-solid outline-2 -outline-offset-2 outline-brand-accent',
      selected: 'outline-solid outline-2 -outline-offset-2 outline-selection',
      none: '',
    },
  },
  defaultVariants: { fill: 'plain', glow: 'none', ring: 'none' },
})

const fillOf = (
  isOverlapping: boolean,
  isOverflowing: boolean,
  isSelected: boolean,
  isInMultiSelection: boolean
): BoxFill => {
  if (isOverlapping) return 'overlapping'
  if (isOverflowing) return 'overflowing'
  if (isSelected) return 'selected'
  if (isInMultiSelection) return 'multi'
  return 'plain'
}

const glowOf = (
  isOverlapping: boolean,
  isOverflowing: boolean,
  isInMultiSelection: boolean
): BoxGlow => {
  if (isOverlapping) return 'overlapping'
  if (isOverflowing) return 'overflowing'
  if (isInMultiSelection) return 'multi'
  return 'none'
}

const ringOf = (isFlashing: boolean, isSelected: boolean): BoxRing => {
  if (isFlashing) return 'flashing'
  if (isSelected) return 'selected'
  return 'none'
}

const signalDropHandlers = ({ widget, onSignalDrop }: WidgetBoxProps) => {
  const acceptsSignal = SIGNAL_CONSUMING_TYPES.has(widget.type)
  return {
    onDragOver: (e: DragEvent) => {
      if (!acceptsSignal || !e.dataTransfer.types.includes(SIGNAL_DRAG_MIME)) return
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'link'
    },
    onDrop: (e: DragEvent) => {
      const name = e.dataTransfer.getData(SIGNAL_DRAG_MIME)
      if (!acceptsSignal || !name) return
      e.preventDefault()
      e.stopPropagation()
      onSignalDrop(widget, name)
    },
  }
}

const boxHandlers = (props: WidgetBoxProps) => ({
  onFocus: () => {
    if (!props.isSelected) props.onSelect(props.widget.id)
  },
  onMouseDown: (e: MouseEvent) => {
    e.stopPropagation()
    if (e.shiftKey) {
      props.onShiftSelect(props.widget.id)
      return
    }
    props.onSelect(props.widget.id)
    props.onDragStart(e, props.widget)
  },
  ...signalDropHandlers(props),
})

const boxClass = (props: WidgetBoxProps): string =>
  cn(
    box({
      fill: fillOf(
        props.isOverlapping,
        props.isOverflowing,
        props.isSelected,
        props.isInMultiSelection
      ),
      glow: glowOf(props.isOverlapping, props.isOverflowing, props.isInMultiSelection),
      ring: ringOf(props.isFlashing, props.isSelected),
    }),
    props.isFlashing && 'widget-rebind-flash'
  )

const boxStyle = (rect: GridRect, scale: number, ground: string | null): CSSProperties => ({
  left: rect.x * scale,
  top: rect.y * scale,
  width: rect.w * scale,
  height: rect.h * scale,
  ...(ground === null ? {} : { background: ground }),
})

const boxRect = ({ widget, areaWidth, areaHeight, hasShiftStrip }: WidgetBoxProps): GridRect =>
  resolvePageWidgetRect(widget, { width: areaWidth, height: areaHeight }, hasShiftStrip)

const ResizeGrip = ({
  widget,
  onResizeStart,
}: {
  widget: Widget
  onResizeStart: NonNullable<WidgetBoxProps['onResizeStart']>
}) => (
  <div
    role="separator"
    aria-label={`Resize ${widget.type}`}
    title="Drag to resize"
    onPointerDown={(e) => {
      onResizeStart(e, widget)
    }}
    onMouseDown={(e) => {
      e.stopPropagation()
    }}
    className="absolute inset-y-0 right-0 z-2 cursor-ew-resize bg-transparent hover:bg-white/10"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ width: GRIP_WIDTH_PX }}
  />
)

export const WidgetBox = memo(function WidgetBox(props: WidgetBoxProps) {
  const { widget, scale, isSelected, isOverflowing, onResizeStart } = props
  const { layout } = widget
  const rect = boxRect(props)
  const isPlain =
    fillOf(props.isOverlapping, isOverflowing, isSelected, props.isInMultiSelection) === 'plain'
  return (
    <div
      data-widget="true"
      role="button"
      tabIndex={0}
      aria-label={`${widget.type} widget at column ${String(layout.col)}, row ${String(layout.row)}`}
      aria-pressed={isSelected}
      title={isOverflowing ? 'Widget spans past the 12-column grid' : undefined}
      {...boxHandlers(props)}
      className={boxClass(props)}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={boxStyle(rect, scale, isPlain ? props.groundColor : null)}
    >
      {onResizeStart && <ResizeGrip widget={widget} onResizeStart={onResizeStart} />}
      <WidgetPreview
        widget={widget}
        palette={props.palette}
        displayW={rect.w * scale}
        displayH={rect.h * scale}
        scale={scale}
        revLimiting={props.revLimiting}
      />
    </div>
  )
})
