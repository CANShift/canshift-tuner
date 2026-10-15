import { memo } from 'react'
import {
  GAUGE_ARC,
  GAUGE_TRACK_COLORS,
  STALE_PLACEHOLDER,
  gaugeValueFontSize,
  type GaugeSeverity,
  type GaugeWidgetConfig,
  type SignalWarnLevels,
  type Widget,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import { WIDGET_DIM_COLOR } from '../widget-preview.styles'
import { gaugeArcD, gaugePreviewSeverity, severityInk, shownValue } from './gauge-math'
import { type BaseRendererProps } from './shared'
import { shownKicker } from '../../../lib/widget-kicker'
import { MONO_FONT, UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../../lib/typography'

export interface GaugeArcRendererProps extends BaseRendererProps {
  scale: number
  revLimiting: boolean
  danger: boolean
  testValue?: number | null
  toDisplay: (value: number) => number
  unbound?: boolean
  signalWarn?: SignalWarnLevels | undefined
}

const SIGNAL_LABEL_FONT_SIZE = 9

const BLINK = '[animation:canshift-blink_0.7s_step-end_infinite]'

interface ArcGeometry {
  cx: number
  cy: number
  r: number
  strokeW: number
  maxOuterR: number
}

const arcGeometry = (w: number, h: number): ArcGeometry => {
  const maxOuterR = Math.min(w, h) / 2 - GAUGE_ARC.containerPadding / 2
  const idealR = maxOuterR / (1 + GAUGE_ARC.strokeRatio / 2)
  const strokeW = Math.max(GAUGE_ARC.strokeWidthFloor, idealR * GAUGE_ARC.strokeRatio)
  return { cx: w / 2, cy: h * 0.5, r: maxOuterR - strokeW / 2, strokeW, maxOuterR }
}

interface ArcReading {
  valuePct: number
  valueStr: string
  inkColor: string
  severity: GaugeSeverity
}

const arcReading = (
  widget: Widget,
  cfg: GaugeWidgetConfig,
  props: GaugeArcRendererProps
): ArcReading => {
  const unbound = props.unbound ?? false
  const bound = shownValue(props.testValue, cfg.minValue, cfg.maxValue, props.toDisplay)
  const valuePct = unbound ? 0 : bound.pct
  const severity = unbound ? 'normal' : gaugePreviewSeverity(cfg, props.testValue, props.signalWarn)
  return {
    valuePct,
    valueStr: unbound ? STALE_PLACEHOLDER : bound.raw.toFixed(cfg.decimalPlaces),
    inkColor: severityInk(severity, widget.style.textColor, widget.style.criticalColor),
    severity,
  }
}

const RevFlash = ({
  geometry,
  w,
  h,
  active,
}: {
  geometry: ArcGeometry
  w: number
  h: number
  active: boolean
}) => (
  <>
    {active && <rect x={0} y={0} width={w} height={h} fill="#FF000022" />}
    <circle
      cx={geometry.cx}
      cy={geometry.cy}
      r={Math.min(geometry.r + geometry.strokeW * 0.6, geometry.maxOuterR - 1.5)}
      fill="none"
      stroke="#FF0000"
      strokeWidth={active ? 3 : 1.5}
      opacity={active ? 1 : 0.45}
      strokeDasharray={active ? undefined : '4 3'}
    />
  </>
)

const ArcTracks = ({
  geometry,
  reading,
  danger,
}: {
  geometry: ArcGeometry
  reading: ArcReading
  danger: boolean
}) => {
  const { cx, cy, r, strokeW } = geometry
  return (
    <>
      <path
        d={gaugeArcD(cx, cy, r, 0, 1)}
        fill="none"
        stroke={GAUGE_TRACK_COLORS.plain}
        strokeWidth={strokeW}
        strokeLinecap="butt"
      />
      <path
        d={gaugeArcD(cx, cy, r, 0, reading.valuePct)}
        fill="none"
        stroke={reading.inkColor}
        strokeWidth={strokeW}
        strokeLinecap="butt"
        className={cn(danger && BLINK)}
      />
    </>
  )
}

interface ArcValueProps {
  geometry: ArcGeometry
  reading: ArcReading
  fontSize: number
  danger: boolean
}

const ArcValue = ({ geometry, reading, fontSize, danger }: ArcValueProps) => (
  <text
    x={geometry.cx}
    y={geometry.cy}
    textAnchor="middle"
    dominantBaseline="middle"
    fill={reading.inkColor}
    fontSize={fontSize}
    fontWeight="900"
    fontFamily={MONO_FONT}
    className={cn(danger && BLINK)}
  >
    {reading.valueStr}
  </text>
)

const SignalLabel = ({ widget, reading }: { widget: Widget; reading: ArcReading }) => (
  <text
    x={4}
    y={SIGNAL_LABEL_FONT_SIZE + 4}
    textAnchor="start"
    dominantBaseline="auto"
    fill={reading.severity === 'normal' ? WIDGET_DIM_COLOR : reading.inkColor}
    fontSize={SIGNAL_LABEL_FONT_SIZE}
    fontFamily={UI_FONT}
    fontWeight={UI_LABEL_WEIGHT}
    letterSpacing={UI_LABEL_TRACKING}
    className="uppercase"
  >
    {shownKicker(widget)}
  </text>
)

export const GaugeArcPreview = memo(function GaugeArcPreview(props: GaugeArcRendererProps) {
  const { widget, w, h, revLimiting, danger, scale } = props
  if (widget.config.type !== 'gauge') return null
  const cfg = widget.config
  const geometry = arcGeometry(w, h)
  const reading = arcReading(widget, cfg, props)
  const fontSize = gaugeValueFontSize(h / scale, cfg.big) * scale
  return (
    <svg width={w} height={h} className="block overflow-hidden" aria-hidden="true">
      {cfg.revFlash === true && <RevFlash geometry={geometry} w={w} h={h} active={revLimiting} />}
      <ArcTracks geometry={geometry} reading={reading} danger={danger} />
      <ArcValue geometry={geometry} reading={reading} fontSize={fontSize} danger={danger} />
      <SignalLabel widget={widget} reading={reading} />
    </svg>
  )
})
