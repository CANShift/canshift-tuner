import { memo, type DragEvent, type MouseEvent } from 'react'
import type { PagePalette, Widget } from '@canshift/core'
import { resolveGridRect } from '@canshift/core'
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
  isSelected: boolean
  isInMultiSelection: boolean
  isOverlapping: boolean
  isOverflowing: boolean
  isFlashing: boolean
  revLimiting: boolean
  onSelect: (id: string) => void
  onShiftSelect: (id: string) => void
  onDragStart: (e: MouseEvent, widget: Widget) => void
  onSignalDrop: (widget: Widget, signalName: string) => void
}

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
      plain: 'bg-black',
    },
    glow: {
      overlapping: 'shadow-[0_0_0_1px_#FF222244,0_0_8px_#FF222288]',
      overflowing: 'shadow-[0_0_0_1px_#FF880044,0_0_8px_#FF880088]',
      multi: 'shadow-[0_0_0_1px_#AAAAFF22,0_0_4px_#AAAAFF44]',
      none: '',
    },
    ring: {
      flashing: 'outline outline-2 -outline-offset-2 outline-brand-accent',
      selected: 'outline outline-2 -outline-offset-2 outline-selection',
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

export const WidgetBox = memo(function WidgetBox({
  widget,
  palette,
  scale,
  areaWidth,
  areaHeight,
  isSelected,
  isInMultiSelection,
  isOverlapping,
  isOverflowing,
  isFlashing,
  revLimiting,
  onSelect,
  onShiftSelect,
  onDragStart,
  onSignalDrop,
}: WidgetBoxProps) {
  const acceptsSignal = SIGNAL_CONSUMING_TYPES.has(widget.type)
  const { layout } = widget
  const rect = resolveGridRect(layout, { width: areaWidth, height: areaHeight })
  const displayW = rect.w * scale
  const displayH = rect.h * scale

  return (
    <div
      data-widget="true"
      role="button"
      tabIndex={0}
      aria-label={`${widget.type} widget at column ${String(layout.col)}, row ${String(layout.row)}`}
      aria-pressed={isSelected}
      title={isOverflowing ? 'Widget spans past the 12-column grid' : undefined}
      onFocus={() => {
        if (!isSelected) onSelect(widget.id)
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        if (e.shiftKey) {
          onShiftSelect(widget.id)
        } else {
          onSelect(widget.id)
          onDragStart(e, widget)
        }
      }}
      onDragOver={(e: DragEvent) => {
        if (!acceptsSignal || !e.dataTransfer.types.includes(SIGNAL_DRAG_MIME)) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'link'
      }}
      onDrop={(e: DragEvent) => {
        const name = e.dataTransfer.getData(SIGNAL_DRAG_MIME)
        if (!acceptsSignal || !name) return
        e.preventDefault()
        e.stopPropagation()
        onSignalDrop(widget, name)
      }}
      className={cn(
        box({
          fill: fillOf(isOverlapping, isOverflowing, isSelected, isInMultiSelection),
          glow: glowOf(isOverlapping, isOverflowing, isInMultiSelection),
          ring: ringOf(isFlashing, isSelected),
        }),
        isFlashing && 'widget-rebind-flash'
      )}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        left: rect.x * scale,
        top: rect.y * scale,
        width: displayW,
        height: displayH,
      }}
    >
      <WidgetPreview
        widget={widget}
        palette={palette}
        displayW={displayW}
        displayH={displayH}
        revLimiting={revLimiting}
      />
    </div>
  )
})
