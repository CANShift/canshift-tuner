import { memo } from 'react'
import {
  SECONDARY_BAR,
  STALE_PLACEHOLDER,
  WIDGET_TOP_RULE,
  deviceValueFontPx,
  valueUnitFontSize,
  widgetTopRulePx,
} from '@canshift/core'
import { BLINK_ANIM } from '../widgetPreview.styles'
import { effectiveValue } from './gauge-math'
import { type BaseRendererProps, formatSignalLabel } from './shared'
import { MONO_FONT, uiLabelAtSize } from '../../../lib/typography'

export interface GaugeNumericRendererProps extends BaseRendererProps {
  danger: boolean
  testValue?: number | null
  signalUnit: string
  unbound?: boolean
}

export const GaugeNumericPreview = memo(function GaugeNumericPreview({
  widget,
  w,
  h,
  danger,
  testValue,
  signalUnit,
  unbound = false,
}: GaugeNumericRendererProps) {
  if (widget.config.type !== 'gauge') return null
  const cfg = widget.config
  const st = widget.style

  const bound = effectiveValue(testValue, cfg.minValue, cfg.maxValue)
  const valuePct = unbound ? 0 : bound.pct
  const valueOnly = unbound ? STALE_PLACEHOLDER : bound.raw.toFixed(cfg.decimalPlaces)
  const showBar = cfg.showBar === true && cfg.maxValue > cfg.minValue
  const prefix = cfg.prefix ?? ''

  const valueColor = st.textColor

  const signalLabel = formatSignalLabel(widget.signal)
  const sigHeaderH = 14
  const availH = h - sigHeaderH

  const valueStr = String(valueOnly)
  const charBudget = valueStr.length + prefix.length + signalUnit.length * 0.45
  const autoSize = Math.max(10, Math.min(availH * 0.85, (w - 16) / (charBudget * 0.68)))
  const fontSize = cfg.big !== undefined ? deviceValueFontPx(cfg.big) : autoSize
  const rulePx = widgetTopRulePx(Math.round(fontSize))
  const ruleColor = danger
    ? WIDGET_TOP_RULE.dangerColor
    : rulePx === WIDGET_TOP_RULE.primaryPx
      ? valueColor
      : WIDGET_TOP_RULE.trackColor

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
        padding: `${String(sigHeaderH + 2)}px 4px 2px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        gap: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: rulePx,
          background: ruleColor,
          animation: danger ? BLINK_ANIM : undefined,
        }}
      />
      {showBar && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 4,
            right: 4,
            height: SECONDARY_BAR.heightPx,
            background: WIDGET_TOP_RULE.trackColor,
          }}
        >
          <span
            style={{
              display: 'block',
              width: `${String(Math.round(Math.max(0, Math.min(1, valuePct)) * 100))}%`,
              height: '100%',
              background: valueColor,
            }}
          />
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          ...uiLabelAtSize(9),
          fontWeight: 500,
          color: '#888888',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: `calc(100% - 8px)`,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {signalLabel.toUpperCase()}
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 4,
          width: '100%',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: valueColor,
            fontFamily: MONO_FONT,
            fontWeight: 800,
            fontSize,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'clip',
            textAlign: 'left',
            animation: danger ? BLINK_ANIM : undefined,
          }}
        >
          {prefix + valueStr}
        </span>
        {signalUnit !== '' && (
          <span
            style={{
              color: '#888888',
              fontSize: valueUnitFontSize(Math.round(fontSize)),
              fontFamily: MONO_FONT,
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {signalUnit}
          </span>
        )}
      </div>
    </div>
  )
})
