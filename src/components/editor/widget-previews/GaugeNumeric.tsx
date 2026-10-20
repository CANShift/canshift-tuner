import { memo } from 'react'
import {
  SECONDARY_BAR,
  STALE_PLACEHOLDER,
  WIDGET_TOP_RULE,
  gaugeValueFontSize,
  valueUnitFontSize,
  type GaugeSeverity,
  type GaugeWidgetConfig,
  type SignalLimits,
  type Widget,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import { BLINK, WIDGET_DIM_COLOR, WIDGET_KICKER } from '../widget-preview.styles'
import { TopRule } from './TopRule'
import { gaugePreviewSeverity, severityInk, shownValue } from './gauge-math'
import { type BaseRendererProps } from './shared'
import { shownKicker } from '../../../lib/widget-kicker'

const FRAME = 'relative box-border flex flex-col items-center justify-center gap-0 overflow-hidden'

const BAR_TRACK = 'absolute bottom-0 left-1 right-1'

const BAR_FILL = 'block h-full'

const VALUE_ROW = 'flex w-full shrink-0 flex-row items-baseline justify-center gap-1'

const VALUE = [
  'overflow-hidden whitespace-nowrap text-left text-clip',
  'font-mono font-extrabold leading-none',
].join(' ')

const UNIT = 'pointer-events-none whitespace-nowrap font-mono font-medium leading-none'

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

const SIGNAL_HEADER_PX = 14

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

const SecondaryBar = ({ pct, color }: { pct: number; color: string }) => (
  <span
    aria-hidden="true"
    className={BAR_TRACK}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ height: SECONDARY_BAR.heightPx, background: WIDGET_TOP_RULE.trackColor }}
  >
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={BAR_FILL} style={{ width: fillPercent(pct), background: color }} />
  </span>
)

interface ValueRowProps {
  text: string
  unit: string
  color: string
  fontSize: number
  danger: boolean
}

const ValueRow = ({ text, unit, color, fontSize, danger }: ValueRowProps) => (
  <div className={VALUE_ROW}>
    <span
      className={cn(VALUE, danger && BLINK)}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ color, fontSize }}
    >
      {text}
    </span>
    {unit !== '' && (
      <span
        className={UNIT}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ color: WIDGET_DIM_COLOR, fontSize: valueUnitFontSize(Math.round(fontSize)) }}
      >
        {unit}
      </span>
    )}
  </div>
)

interface NumericRuleProps {
  fontSize: number
  widget: Widget
  reading: NumericReading
  blink: boolean
}

const NumericRule = ({ fontSize, widget, reading, blink }: NumericRuleProps) => (
  <TopRule
    fontSize={fontSize}
    inkColor={widget.style.textColor}
    severity={reading.severity}
    blink={blink}
  />
)

const NumericKicker = ({ widget, reading }: { widget: Widget; reading: NumericReading }) => (
  <span
    className={WIDGET_KICKER}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={reading.severity === 'normal' ? undefined : { color: reading.ink }}
  >
    {shownKicker(widget)}
  </span>
)

export const GaugeNumericPreview = memo(function GaugeNumericPreview(
  props: GaugeNumericRendererProps
) {
  const { widget, w, h, danger, signalUnit, scale } = props
  if (widget.config.type !== 'gauge') return null
  const cfg = widget.config
  const reading = numericReading(cfg, props)
  const fontSize = gaugeValueFontSize(h / scale, cfg.big) * scale
  const showBar = cfg.showBar === true && cfg.maxValue > cfg.minValue
  return (
    <div
      className={FRAME}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: w, height: h, padding: `${String(SIGNAL_HEADER_PX + 2)}px 4px 2px` }}
    >
      <NumericRule fontSize={fontSize} widget={widget} reading={reading} blink={danger} />
      {showBar && <SecondaryBar pct={reading.pct} color={reading.ink} />}
      <NumericKicker widget={widget} reading={reading} />
      <ValueRow
        text={reading.text}
        unit={signalUnit}
        color={reading.ink}
        fontSize={fontSize}
        danger={danger}
      />
    </div>
  )
})
