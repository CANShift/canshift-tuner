import { memo } from 'react'
import {
  STALE_PLACEHOLDER,
  WIDGET_TOP_RULE,
  deviceValueFontPx,
  widgetTopRulePx,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import { type BaseRendererProps, formatSignalLabel } from './shared'
import { WIDGET_KICKER, ruleTier, widgetTopRule } from '../widget-preview.styles'

const FRAME = 'relative box-border flex flex-col items-center justify-center overflow-hidden'

const VALUE_ROW = 'flex w-full shrink-0 items-center justify-center'

const VALUE = 'inline-block w-full text-center font-mono font-extrabold leading-none'

interface GearRendererProps extends BaseRendererProps {
  unbound?: boolean
}

const AUTO_FONT_MIN_PX = 10
const AUTO_FONT_MAX_PX = 48
const AUTO_FONT_WIDTH_RATIO = 0.72
const AUTO_FONT_HEIGHT_RATIO = 0.85

const autoFontPx = (w: number, h: number): number =>
  Math.max(
    AUTO_FONT_MIN_PX,
    Math.min(AUTO_FONT_MAX_PX, w * AUTO_FONT_WIDTH_RATIO, h * AUTO_FONT_HEIGHT_RATIO)
  )

export const GearPreview = memo(function GearPreview({
  widget,
  w,
  h,
  unbound = false,
}: GearRendererProps) {
  if (widget.config.type !== 'gear') return null
  const cfg = widget.config
  const st = widget.style
  const fontSize = cfg.big !== undefined ? deviceValueFontPx(cfg.big) : autoFontPx(w, h)
  const rulePx = widgetTopRulePx(Math.round(fontSize))
  const ruleColor = rulePx === WIDGET_TOP_RULE.primaryPx ? st.textColor : WIDGET_TOP_RULE.trackColor

  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className={FRAME} style={{ width: w, height: h }}>
      <span
        aria-hidden="true"
        className={cn(widgetTopRule({ tier: ruleTier(rulePx) }))}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ background: ruleColor }}
      />
      <span className={WIDGET_KICKER}>{formatSignalLabel(widget.signal)}</span>
      <div className={VALUE_ROW}>
        <span
          className={VALUE}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: st.textColor, fontSize }}
        >
          {unbound ? STALE_PLACEHOLDER : '3'}
        </span>
      </div>
    </div>
  )
})
