import { memo } from 'react'
import {
  SECONDARY_BAR,
  STALE_PLACEHOLDER,
  WIDGET_TOP_RULE,
  deviceValueFontPx,
  valueUnitFontSize,
  widgetTopRulePx,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import {
  BLINK,
  WIDGET_DIM_COLOR,
  WIDGET_KICKER,
  ruleTier,
  widgetTopRule,
} from '../widget-preview.styles'
import { effectiveValue } from './gauge-math'
import { type BaseRendererProps, formatSignalLabel } from './shared'

const FRAME = 'relative box-border flex flex-col items-center justify-center gap-0 overflow-hidden'

const BAR_TRACK = 'absolute bottom-0 left-1 right-1'

const BAR_FILL = 'block h-full'

const VALUE_ROW = 'flex w-full shrink-0 flex-row items-baseline justify-center gap-1'

const VALUE = [
  'overflow-hidden whitespace-nowrap text-left [text-overflow:clip]',
  'font-mono font-extrabold leading-none',
].join(' ')

const UNIT = 'pointer-events-none whitespace-nowrap font-mono font-medium leading-none'

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
      className={FRAME}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: w, height: h, padding: `${String(sigHeaderH + 2)}px 4px 2px` }}
    >
      <span
        aria-hidden="true"
        className={cn(widgetTopRule({ tier: ruleTier(rulePx), blink: danger }))}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ background: ruleColor }}
      />
      {showBar && (
        <span
          aria-hidden="true"
          className={BAR_TRACK}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ height: SECONDARY_BAR.heightPx, background: WIDGET_TOP_RULE.trackColor }}
        >
          <span
            className={BAR_FILL}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{
              width: `${String(Math.round(Math.max(0, Math.min(1, valuePct)) * 100))}%`,
              background: valueColor,
            }}
          />
        </span>
      )}
      <span className={WIDGET_KICKER}>{signalLabel.toUpperCase()}</span>
      <div className={VALUE_ROW}>
        <span
          className={cn(VALUE, danger && BLINK)}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: valueColor, fontSize }}
        >
          {prefix + valueStr}
        </span>
        {signalUnit !== '' && (
          <span
            className={UNIT}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ color: WIDGET_DIM_COLOR, fontSize: valueUnitFontSize(Math.round(fontSize)) }}
          >
            {signalUnit}
          </span>
        )}
      </div>
    </div>
  )
})
