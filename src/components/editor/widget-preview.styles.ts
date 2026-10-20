import type { CSSProperties } from 'react'
import { cva } from 'class-variance-authority'
import { WIDGET_DIM_COLORS, WIDGET_TOP_RULE } from '@canshift/core'

export const BLINK = 'animate-[canshift-blink_0.7s_step-end_infinite]'

export const WIDGET_DIM_COLOR: string = WIDGET_DIM_COLORS.night

export const KICKER_METRICS = {
  fontPx: 10,
  insetPx: 4,
  trackingPx: 2,
  rightInsetPx: 8,
} as const

export const WIDGET_KICKER = [
  'absolute overflow-hidden text-clip whitespace-nowrap',
  'font-sans font-extrabold uppercase leading-none',
  'text-[#BABAB8]',
].join(' ')

export const kickerStyle = (scale: number): CSSProperties => ({
  left: KICKER_METRICS.insetPx * scale,
  top: KICKER_METRICS.insetPx * scale,
  maxWidth: `calc(100% - ${String(KICKER_METRICS.rightInsetPx * scale)}px)`,
  fontSize: KICKER_METRICS.fontPx * scale,
  letterSpacing: KICKER_METRICS.trackingPx * scale,
})

export const widgetTopRule = cva('absolute left-0 right-0 top-0', {
  variants: {
    blink: { true: BLINK, false: '' },
  },
  defaultVariants: { blink: false },
})

export const isPrimaryRule = (rulePx: number): boolean => rulePx === WIDGET_TOP_RULE.primaryPx
