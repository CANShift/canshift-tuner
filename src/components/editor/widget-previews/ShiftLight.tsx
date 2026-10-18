import { memo } from 'react'
import { SHIFT_LIGHT, shiftLightLitSegments } from '@canshift/core'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { effectiveValue } from './gauge-math'
import { type BaseRendererProps } from './shared'

export interface ShiftLightRendererProps extends BaseRendererProps {
  testValue?: number | null
}

const segmentColor = (index: number, lit: number, redFrom: number, textColor: string): string => {
  if (index >= lit) return SHIFT_LIGHT.trackColor
  if (index >= redFrom) return SHIFT_LIGHT.redColor
  return textColor
}

export const ShiftLightPreview = memo(function ShiftLightPreview({
  widget,
  w,
  h,
  testValue,
}: ShiftLightRendererProps) {
  const revLimit = useDashboardStore((s) => s.config?.revLimitRpm ?? 0)
  if (widget.config.type !== 'shift_light') return null
  const cfg = widget.config
  const st = widget.style

  const fullValue = revLimit > cfg.startValue ? revLimit : cfg.startValue + 1
  const { raw: demoValue } = effectiveValue(testValue, cfg.startValue, fullValue)
  const lit = shiftLightLitSegments(demoValue, cfg.startValue, fullValue)

  const gap = SHIFT_LIGHT.gapPx
  const segW = (w - gap * (SHIFT_LIGHT.segments - 1)) / SHIFT_LIGHT.segments
  const redFrom =
    cfg.redSegments >= SHIFT_LIGHT.segments ? 0 : SHIFT_LIGHT.segments - cfg.redSegments
  const fills = Array.from({ length: SHIFT_LIGHT.segments }, (_, i) =>
    segmentColor(i, lit, redFrom, st.textColor)
  )

  return (
    <svg width={w} height={h} className="block" aria-hidden="true">
      {fills.map((fill, i) => (
        <rect key={i} x={i * (segW + gap)} y={0} width={segW} height={h} fill={fill} />
      ))}
    </svg>
  )
})
