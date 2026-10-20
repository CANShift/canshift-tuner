import { memo } from 'react'
import { deviceValueFontPx } from '@canshift/core'
import type { BaseRendererProps } from './shared'
import { timerDemoValue, timerKicker, timerUnit } from '../../../lib/timer-source'
import { useDisplayUnits } from '../../../hooks/useDisplayUnits'
import { TopRule } from './TopRule'
import { Kicker, ValueRow } from './ValueCluster'

const FRAME = 'relative box-border overflow-hidden'

const LARGE_TIME = { minH: 55, minW: 150, px: 40 } as const

const MEDIUM_TIME = { minH: 28, px: 22 } as const

const SMALL_TIME_PX = 17

const timeFontPx = (w: number, h: number): number => {
  if (h >= LARGE_TIME.minH && w >= LARGE_TIME.minW) return LARGE_TIME.px
  return h >= MEDIUM_TIME.minH ? MEDIUM_TIME.px : SMALL_TIME_PX
}

interface TimerRendererProps extends BaseRendererProps {
  scale: number
}

export const TimerPreview = memo(function TimerPreview({
  widget,
  w,
  h,
  scale,
}: TimerRendererProps) {
  const units = useDisplayUnits().system
  if (widget.config.type !== 'timer') return null
  const cfg = widget.config
  const ink = widget.style.textColor
  const devicePx =
    cfg.big !== undefined ? deviceValueFontPx(cfg.big) : timeFontPx(w / scale, h / scale)

  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className={FRAME} style={{ width: w, height: h }}>
      <TopRule devicePx={devicePx} scale={scale} inkColor={ink} />
      <Kicker text={timerKicker(cfg.source, units)} scale={scale} />
      <ValueRow
        text={timerDemoValue(cfg.source, cfg.format)}
        unit={timerUnit(cfg.source)}
        color={ink}
        devicePx={devicePx}
        scale={scale}
      />
    </div>
  )
})
