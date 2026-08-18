import { BRAND_ACCENT } from '@canshift/core'

const FRAME_PATH = 'M22 18 H98 V86 H22 Z'
const FRAME_STROKE = 7

const BARS: readonly { d: string; accent: boolean }[] = [
  { d: 'M36 34 H74', accent: true },
  { d: 'M36 52 H84', accent: false },
  { d: 'M36 70 H62', accent: false },
]

const BAR_STROKE = 13
const VIEW_BOX = '0 0 116 100'
const ASPECT = 116 / 100
const SKEW = 'translate(10,0) skewX(-11)'

export interface TunerMarkProps {
  height: number
  label?: string
}

export const TunerMark = ({ height, label = 'CANShift Tuner' }: TunerMarkProps) => (
  <svg
    viewBox={VIEW_BOX}
    height={height}
    width={height * ASPECT}
    role="img"
    aria-label={label}
    fill="none"
    className="shrink-0"
  >
    <g transform={SKEW}>
      <path d={FRAME_PATH} stroke="currentColor" strokeWidth={FRAME_STROKE} />
      {BARS.map((bar) => (
        <path
          key={bar.d}
          d={bar.d}
          stroke={bar.accent ? BRAND_ACCENT : 'currentColor'}
          strokeWidth={BAR_STROKE}
        />
      ))}
    </g>
  </svg>
)
