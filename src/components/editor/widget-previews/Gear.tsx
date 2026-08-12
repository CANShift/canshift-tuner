import { memo } from 'react'
import {
  STALE_PLACEHOLDER,
  WIDGET_TOP_RULE,
  deviceValueFontPx,
  widgetTopRulePx,
} from '@canshift/core'
import { type BaseRendererProps, formatSignalLabel } from './shared'
import { MONO_FONT } from '../../../lib/typography'
import { widgetKickerStyle, widgetTopRuleStyle } from '../widget-preview.styles'

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
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <span aria-hidden="true" style={widgetTopRuleStyle(rulePx, ruleColor, false)} />
      <span style={widgetKickerStyle}>{formatSignalLabel(widget.signal)}</span>
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: st.textColor,
            fontSize,
            fontWeight: 800,
            fontFamily: MONO_FONT,
            lineHeight: 1,
            textAlign: 'center',
            width: '100%',
            display: 'inline-block',
          }}
        >
          {unbound ? STALE_PLACEHOLDER : '3'}
        </span>
      </div>
    </div>
  )
})
