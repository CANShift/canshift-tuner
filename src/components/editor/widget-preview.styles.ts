import type { CSSProperties } from 'react'
import { uiLabelAtSize } from '../../lib/typography'

export const BLINK_ANIM = 'canshift-blink 0.7s step-end infinite'

export const WIDGET_DIM_COLOR = '#888888'

const KICKER_FONT_PX = 10
const KICKER_INSET_PX = 4

export const widgetKickerStyle: CSSProperties = {
  ...uiLabelAtSize(KICKER_FONT_PX),
  position: 'absolute',
  top: KICKER_INSET_PX,
  left: KICKER_INSET_PX,
  color: WIDGET_DIM_COLOR,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: `calc(100% - ${String(KICKER_INSET_PX * 2)}px)`,
}

export const widgetTopRuleStyle = (
  rulePx: number,
  color: string,
  blink: boolean
): CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: rulePx,
  background: color,
  animation: blink ? BLINK_ANIM : undefined,
})

export const thresholdPct = (level: number, min: number, max: number): number => {
  const range = max - min || 1
  return Math.max(0, Math.min(1, (level - min) / range))
}
