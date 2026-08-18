import {
  BASELINE_TEXT_PATH,
  BRAND_ACCENT,
  LOCKUP_BASELINE_OPACITY,
  LOCKUP_BASELINE_TRANSFORM,
  LOCKUP_BASELINE_VIEWBOX,
  LOCKUP_DIVIDER,
  LOCKUP_MONOGRAM_TRANSFORM,
  LOCKUP_VIEWBOX,
  LOCKUP_WORDMARK_TRANSFORM,
  MONOGRAM_C_PATH,
  MONOGRAM_S_PATH,
  MONOGRAM_STROKE_WIDTH,
  WORDMARK_CAN_PATH,
  WORDMARK_SHIFT_PATH,
} from '@canshift/core'
import type { ReactElement } from 'react'
import { TUNER_MARK_BAR_PATH, TUNER_MARK_SCREEN_PATH, TUNER_MARK_STROKE } from './tuner-mark'

export type BrandMark = 'monogram' | 'tuner'

export interface BrandLockupProps {
  height: number
  mark?: BrandMark
  withBaseline?: boolean
  label?: string
}

const MonogramMark = () => (
  <>
    <path d={MONOGRAM_C_PATH} stroke="currentColor" strokeWidth={MONOGRAM_STROKE_WIDTH} />
    <path d={MONOGRAM_S_PATH} stroke={BRAND_ACCENT} strokeWidth={MONOGRAM_STROKE_WIDTH} />
  </>
)

const TunerMark = () => (
  <>
    <path d={TUNER_MARK_SCREEN_PATH} stroke="currentColor" strokeWidth={TUNER_MARK_STROKE} />
    <path d={TUNER_MARK_BAR_PATH} stroke={BRAND_ACCENT} strokeWidth={TUNER_MARK_STROKE} />
  </>
)

const MARKS: Record<BrandMark, () => ReactElement> = {
  monogram: MonogramMark,
  tuner: TunerMark,
}

export const BrandLockup = ({
  height,
  mark = 'monogram',
  withBaseline = false,
  label = 'CANShift',
}: BrandLockupProps) => {
  const Mark = MARKS[mark]
  const viewBox = withBaseline ? LOCKUP_BASELINE_VIEWBOX : LOCKUP_VIEWBOX
  const viewBoxHeight = withBaseline ? 190 : 150
  return (
    <svg
      viewBox={viewBox}
      height={height}
      width={(height * 590) / viewBoxHeight}
      role="img"
      aria-label={label}
    >
      <g transform={LOCKUP_MONOGRAM_TRANSFORM} fill="none" strokeLinecap="butt">
        <Mark />
      </g>
      <rect
        x={LOCKUP_DIVIDER.x}
        y={LOCKUP_DIVIDER.y}
        width={LOCKUP_DIVIDER.width}
        height={LOCKUP_DIVIDER.height}
        fill="currentColor"
        opacity={LOCKUP_DIVIDER.opacity}
      />
      <g transform={LOCKUP_WORDMARK_TRANSFORM}>
        <path fill="currentColor" d={WORDMARK_CAN_PATH} />
        <path fill={BRAND_ACCENT} d={WORDMARK_SHIFT_PATH} />
      </g>
      {withBaseline ? (
        <g
          transform={LOCKUP_BASELINE_TRANSFORM}
          fill="currentColor"
          opacity={LOCKUP_BASELINE_OPACITY}
        >
          <path d={BASELINE_TEXT_PATH} />
        </g>
      ) : null}
    </svg>
  )
}
