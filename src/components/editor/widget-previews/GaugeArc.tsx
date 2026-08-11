import { memo } from 'react'
import { GAUGE_ARC, GAUGE_TRACK_COLORS, STALE_PLACEHOLDER } from '@canshift/core'
import { BLINK_ANIM, thresholdPct } from '../widgetPreview.styles'
import { effectiveValue, gaugeArcD } from './gauge-math'
import { type BaseRendererProps, formatSignalLabel } from './shared'
import { MONO_FONT, UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../../lib/typography'

export interface GaugeArcRendererProps extends BaseRendererProps {
  revLimiting: boolean
  danger: boolean
  testValue?: number | null
  unbound?: boolean
}

const SIGNAL_LABEL_FONT_SIZE = 9

export const GaugeArcPreview = memo(function GaugeArcPreview({
  widget,
  w,
  h,
  revLimiting,
  danger,
  testValue,
  unbound = false,
}: GaugeArcRendererProps) {
  if (widget.config.type !== 'gauge') return null
  const cfg = widget.config
  const st = widget.style

  const dangerPct = thresholdPct(cfg.dangerLevel, cfg.minValue, cfg.maxValue)
  const bound = effectiveValue(testValue, cfg.minValue, cfg.maxValue)
  const valuePct = unbound ? 0 : bound.pct

  const valueStr = unbound ? STALE_PLACEHOLDER : bound.raw.toFixed(cfg.decimalPlaces)

  const inDanger = valuePct >= dangerPct
  const inkColor = inDanger ? st.criticalColor : st.textColor

  const cx = w / 2
  const cy = h * 0.5
  const valueYOffset = 0
  const maxOuterR = Math.min(w, h) / 2 - GAUGE_ARC.containerPadding / 2
  const idealR = maxOuterR / (1 + GAUGE_ARC.strokeRatio / 2)
  const strokeW = Math.max(GAUGE_ARC.strokeWidthFloor, idealR * GAUGE_ARC.strokeRatio)
  const r = maxOuterR - strokeW / 2

  const revFlash = cfg.revFlash === true
  const showRevFlash = revFlash && revLimiting

  const valueFontSize = Math.max(11, Math.min(r * 0.55, h * 0.3, 42))

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'hidden' }} aria-hidden="true">
      {showRevFlash && <rect x={0} y={0} width={w} height={h} fill="#FF000022" />}
      {revFlash && (
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(r + strokeW * 0.6, maxOuterR - 1.5)}
          fill="none"
          stroke="#FF0000"
          strokeWidth={showRevFlash ? 3 : 1.5}
          opacity={showRevFlash ? 1 : 0.45}
          strokeDasharray={showRevFlash ? undefined : '4 3'}
        />
      )}
      <path
        d={gaugeArcD(cx, cy, r, 0, 1)}
        fill="none"
        stroke={GAUGE_TRACK_COLORS.plain}
        strokeWidth={strokeW}
        strokeLinecap="butt"
      />
      <path
        d={gaugeArcD(cx, cy, r, 0, valuePct)}
        fill="none"
        stroke={inkColor}
        strokeWidth={strokeW}
        strokeLinecap="butt"
        style={{ animation: danger ? BLINK_ANIM : undefined }}
      />
      <text
        x={cx}
        y={cy + valueYOffset}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={inkColor}
        fontSize={valueFontSize}
        fontWeight="900"
        fontFamily={MONO_FONT}
        style={{ animation: danger ? BLINK_ANIM : undefined }}
      >
        {valueStr}
      </text>
      <text
        x={4}
        y={SIGNAL_LABEL_FONT_SIZE + 4}
        textAnchor="start"
        dominantBaseline="auto"
        fill="#888888"
        fontSize={SIGNAL_LABEL_FONT_SIZE}
        fontFamily={UI_FONT}
        fontWeight={UI_LABEL_WEIGHT}
        letterSpacing={UI_LABEL_TRACKING}
        style={{ textTransform: 'uppercase' }}
      >
        {formatSignalLabel(widget.signal).toUpperCase()}
      </text>
    </svg>
  )
})
