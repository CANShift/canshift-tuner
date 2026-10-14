import { memo } from 'react'
import { SensorIcon } from '../../icons/SensorIcons'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { type BaseRendererProps, formatSignalLabel } from './shared'

export interface WarningRendererProps extends BaseRendererProps {
  noAnimate: boolean
}

const DEFAULT_ICON = 'warning' as const

const frame = cva(
  'relative box-border flex flex-col items-center justify-center gap-1 overflow-hidden rounded-none',
  {
    variants: {
      blink: { true: '[animation:canshift-blink_0.7s_step-end_infinite]', false: '' },
    },
    defaultVariants: { blink: false },
  }
)

const LABEL = [
  'whitespace-nowrap font-sans text-[9px] font-medium uppercase',
  'leading-none tracking-[0.06em]',
].join(' ')

const SIGNAL_FONT_PX = 9
const LABEL_BAND_PX = SIGNAL_FONT_PX + 4
const MIN_LABEL_HEIGHT = 28
const MAX_ICON_PX = 64

const iconSizeFor = (w: number, h: number): number =>
  Math.max(0, Math.min(w * 0.55, h - LABEL_BAND_PX - 8, MAX_ICON_PX))

const WarningLabel = ({ signal, color }: { signal: string; color: string }) => (
  <span
    className={LABEL}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ color: color + '99' }}
  >
    {formatSignalLabel(signal).toUpperCase()}
  </span>
)

export const WarningPreview = memo(function WarningPreview({
  widget,
  w,
  h,
  noAnimate,
}: WarningRendererProps) {
  if (widget.config.type !== 'warning') return null
  const color = widget.style.criticalColor
  return (
    <div
      className={cn(frame({ blink: !noAnimate }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: w, height: h, background: color + '22' }}
    >
      <SensorIcon
        name={widget.config.iconName ?? DEFAULT_ICON}
        size={iconSizeFor(w, h)}
        color={color}
      />
      {h >= MIN_LABEL_HEIGHT && <WarningLabel signal={widget.signal} color={color} />}
    </div>
  )
})
