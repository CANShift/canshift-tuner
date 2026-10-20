import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { BLINK, WIDGET_DIM_COLOR, WIDGET_KICKER, kickerStyle } from '../widget-preview.styles'

export const UNIT_FONT_PX = 10

const ROW_DROP_PX = 8

const UNIT_GAP_PX = 3

const WIDE_TRACKING = { minPx: 40, px: -2 } as const

const NARROW_TRACKING = { minPx: 14, px: -1 } as const

const ROW = 'absolute left-0 flex -translate-y-1/2 flex-row items-end'

const VALUE = 'whitespace-nowrap font-mono font-extrabold leading-none tabular-nums'

const UNIT = 'pointer-events-none whitespace-nowrap font-mono font-medium leading-none'

export const valueTrackingPx = (devicePx: number): number => {
  if (devicePx >= WIDE_TRACKING.minPx) return WIDE_TRACKING.px
  return devicePx >= NARROW_TRACKING.minPx ? NARROW_TRACKING.px : 0
}

export interface ValueRowProps {
  text: string
  unit: string
  color: string
  devicePx: number
  scale: number
  blink?: boolean
}

const rowStyle = (scale: number): CSSProperties => ({
  top: `calc(50% + ${String(ROW_DROP_PX * scale)}px)`,
  columnGap: UNIT_GAP_PX * scale,
})

export const ValueRow = ({ text, unit, color, devicePx, scale, blink = false }: ValueRowProps) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <div className={ROW} style={rowStyle(scale)}>
    <span
      className={cn(VALUE, blink && BLINK)}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        color,
        fontSize: devicePx * scale,
        letterSpacing: valueTrackingPx(devicePx) * scale,
      }}
    >
      {text}
    </span>
    {unit !== '' && (
      <span
        className={UNIT}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ color: WIDGET_DIM_COLOR, fontSize: UNIT_FONT_PX * scale }}
      >
        {unit}
      </span>
    )}
  </div>
)

export interface KickerProps {
  text: string
  scale: number
  color?: string | undefined
}

export const Kicker = ({ text, scale, color }: KickerProps) => (
  <span
    className={WIDGET_KICKER}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ ...kickerStyle(scale), ...(color === undefined ? {} : { color }) }}
  >
    {text}
  </span>
)
