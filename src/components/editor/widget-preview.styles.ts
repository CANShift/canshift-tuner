import { cva } from 'class-variance-authority'
import { WIDGET_DIM_COLORS, WIDGET_TOP_RULE } from '@canshift/core'

export const BLINK = '[animation:canshift-blink_0.7s_step-end_infinite]'

export const WIDGET_DIM_COLOR: string = WIDGET_DIM_COLORS.night

export const WIDGET_KICKER = [
  'absolute left-1 top-1 max-w-[calc(100%-8px)]',
  'overflow-hidden text-ellipsis whitespace-nowrap',
  'font-sans text-[10px] font-extrabold uppercase leading-none tracking-[0.18em]',
  'text-[#BABAB8]',
].join(' ')

export const widgetTopRule = cva('absolute left-0 right-0 top-0', {
  variants: {
    tier: { primary: 'h-0.5', secondary: 'h-px' },
    blink: { true: BLINK, false: '' },
  },
  defaultVariants: { tier: 'secondary', blink: false },
})

export const ruleTier = (rulePx: number): 'primary' | 'secondary' =>
  rulePx === WIDGET_TOP_RULE.primaryPx ? 'primary' : 'secondary'

export const thresholdPct = (level: number, min: number, max: number): number => {
  const range = max - min || 1
  return Math.max(0, Math.min(1, (level - min) / range))
}
