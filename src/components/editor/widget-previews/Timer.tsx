import { memo } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { BaseRendererProps } from './shared'

const DEMO_MMSS = '01:23'
const DEMO_SS_MMM = '12.847'

const FRAME = 'relative flex items-center justify-center overflow-hidden'

const HEAVY_FONT_MIN_PX = 32

const value = cva('font-mono tracking-[0.06em] tabular-nums', {
  variants: { heavy: { true: 'font-black', false: 'font-bold' } },
  defaultVariants: { heavy: false },
})

const KICKER = [
  'absolute left-[3px] top-0.5 font-sans text-[9px] font-medium uppercase',
  'leading-none tracking-[0.05em] text-[#BABAB8]',
].join(' ')

export const TimerPreview = memo(function TimerPreview({ widget, w, h }: BaseRendererProps) {
  if (widget.config.type !== 'timer') return null
  const cfg = widget.config
  const st = widget.style
  const timeStr = cfg.format === 'ss.mmm' ? DEMO_SS_MMM : DEMO_MMSS
  const fontSize = Math.max(9, Math.min(h * 0.44, w * 0.22))

  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className={FRAME} style={{ width: w, height: h }}>
      <span
        className={cn(value({ heavy: fontSize >= HEAVY_FONT_MIN_PX }))}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ color: st.textColor, fontSize }}
      >
        {timeStr}
      </span>
      <span className={KICKER}>TIMER</span>
    </div>
  )
})
