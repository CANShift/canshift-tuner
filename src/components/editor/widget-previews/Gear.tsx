import { memo } from 'react'
import { STALE_PLACEHOLDER, deviceValueFontPx, gearFontSize } from '@canshift/core'
import { type BaseRendererProps } from './shared'
import { shownKicker } from '../../../lib/widget-kicker'
import { TopRule } from './TopRule'
import { Kicker, ValueRow } from './ValueCluster'

const FRAME = 'relative box-border overflow-hidden'

const DEMO_GEAR = '3'

interface GearRendererProps extends BaseRendererProps {
  scale: number
  unbound?: boolean
}

export const GearPreview = memo(function GearPreview({
  widget,
  w,
  h,
  unbound = false,
  scale,
}: GearRendererProps) {
  if (widget.config.type !== 'gear') return null
  const cfg = widget.config
  const ink = widget.style.textColor
  const devicePx =
    cfg.big !== undefined ? deviceValueFontPx(cfg.big) : gearFontSize(w / scale, h / scale)

  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className={FRAME} style={{ width: w, height: h }}>
      <TopRule devicePx={devicePx} scale={scale} inkColor={ink} />
      <Kicker text={shownKicker(widget)} scale={scale} />
      <ValueRow
        text={unbound ? STALE_PLACEHOLDER : DEMO_GEAR}
        unit=""
        color={ink}
        devicePx={devicePx}
        scale={scale}
      />
    </div>
  )
})
