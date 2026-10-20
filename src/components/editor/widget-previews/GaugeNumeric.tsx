import { memo } from 'react'
import {
  SECONDARY_BAR,
  STALE_PLACEHOLDER,
  WIDGET_TOP_RULE,
  gaugeValueFontSize,
  type GaugeSeverity,
  type GaugeWidgetConfig,
  type SignalLimits,
} from '@canshift/core'
import { TopRule } from './TopRule'
import { Kicker, ValueRow } from './ValueCluster'
import { gaugePreviewSeverity, severityInk, shownValue } from './gauge-math'
import { type BaseRendererProps } from './shared'
import { shownKicker } from '../../../lib/widget-kicker'

const FRAME = 'relative box-border overflow-hidden'

const BAR_TRACK = 'absolute bottom-0 left-0 right-0'

const BAR_FILL = 'block h-full'

export interface GaugeNumericRendererProps extends BaseRendererProps {
  danger: boolean
  testValue?: number | null
  signalUnit: string
  toDisplay: (value: number) => number
  decimalsOf: (decimals: number) => number
  unbound?: boolean
  scale: number
  signalLimits?: SignalLimits | undefined
}

interface NumericReading {
  text: string
  pct: number
  ink: string
  severity: GaugeSeverity
}

const numericReading = (
  cfg: GaugeWidgetConfig,
  props: GaugeNumericRendererProps
): NumericReading => {
  const unbound = props.unbound ?? false
  const bound = shownValue(props.testValue, cfg.minValue, cfg.maxValue, props.toDisplay)
  const value = unbound ? STALE_PLACEHOLDER : bound.raw.toFixed(props.decimalsOf(cfg.decimalPlaces))
  const severity = unbound
    ? 'normal'
    : gaugePreviewSeverity(cfg, props.testValue, props.signalLimits)
  const ink = severityInk(severity, props.widget.style.textColor, props.widget.style.criticalColor)
  return { text: (cfg.prefix ?? '') + String(value), pct: unbound ? 0 : bound.pct, ink, severity }
}

const fillPercent = (pct: number): string =>
  `${String(Math.round(Math.max(0, Math.min(1, pct)) * 100))}%`

const hasBar = (cfg: GaugeWidgetConfig): boolean =>
  cfg.showBar === true && cfg.maxValue > cfg.minValue

const kickerInkOf = (reading: NumericReading): string | undefined =>
  reading.severity === 'normal' ? undefined : reading.ink

interface SecondaryBarProps {
  pct: number
  color: string
  scale: number
}

const SecondaryBar = ({ pct, color, scale }: SecondaryBarProps) => (
  <span
    aria-hidden="true"
    className={BAR_TRACK}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ height: SECONDARY_BAR.heightPx * scale, background: WIDGET_TOP_RULE.trackColor }}
  >
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={BAR_FILL} style={{ width: fillPercent(pct), background: color }} />
  </span>
)

export const GaugeNumericPreview = memo(function GaugeNumericPreview(
  props: GaugeNumericRendererProps
) {
  const { widget, w, h, danger, signalUnit, scale } = props
  if (widget.config.type !== 'gauge') return null
  const cfg = widget.config
  const reading = numericReading(cfg, props)
  const devicePx = gaugeValueFontSize(h / scale, cfg.big)
  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className={FRAME} style={{ width: w, height: h }}>
      <TopRule
        devicePx={devicePx}
        scale={scale}
        inkColor={widget.style.textColor}
        severity={reading.severity}
        blink={danger}
      />
      {hasBar(cfg) && <SecondaryBar pct={reading.pct} color={reading.ink} scale={scale} />}
      <Kicker text={shownKicker(widget)} scale={scale} color={kickerInkOf(reading)} />
      <ValueRow
        text={reading.text}
        unit={signalUnit}
        color={reading.ink}
        devicePx={devicePx}
        scale={scale}
        blink={danger}
      />
    </div>
  )
})
