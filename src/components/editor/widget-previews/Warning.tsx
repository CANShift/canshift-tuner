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

export const WarningPreview = memo(function WarningPreview({
  widget,
  w,
  h,
  noAnimate,
}: WarningRendererProps) {
  if (widget.config.type !== 'warning') return null
  const cfg = widget.config
  const st = widget.style

  const iconName = cfg.iconName ?? DEFAULT_ICON
  const sigFontSize = 9
  const labelH = sigFontSize + 4
  const iconSize = Math.max(0, Math.min(w * 0.55, h - labelH - 8, 64))
  const showSignalLabel = h >= 28

  return (
    <div
      className={cn(frame({ blink: !noAnimate }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: w, height: h, background: st.criticalColor + '22' }}
    >
      <SensorIcon name={iconName} size={iconSize} color={st.criticalColor} />
      {showSignalLabel && (
        <span
          className={LABEL}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: st.criticalColor + '99' }}
        >
          {formatSignalLabel(widget.signal).toUpperCase()}
        </span>
      )}
    </div>
  )
})
