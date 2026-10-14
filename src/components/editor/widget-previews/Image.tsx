import { memo } from 'react'
import type { BaseRendererProps } from './shared'
import { UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../../lib/typography'

const FRAME_BG = '#1A1A1A'
const FRAME_STROKE = '#2A2A2A'
const GLYPH_STROKE = '#333333'
const CAPTION_RGB = '#2A2A2A'

const MOUNTAIN = [
  [0.2, 0.72],
  [0.42, 0.38],
  [0.58, 0.55],
  [0.7, 0.42],
  [0.82, 0.72],
] as const

const mountainPoints = (w: number, h: number): string =>
  MOUNTAIN.map(([x, y]) => `${String(w * x)},${String(h * y)}`).join(' ')

const ImageCaption = ({ w, h }: { w: number; h: number }) => (
  <text
    x={w / 2}
    y={h - 6}
    textAnchor="middle"
    dominantBaseline="auto"
    fill={CAPTION_RGB}
    fontSize={Math.max(5, Math.min(7, w * 0.07))}
    fontFamily={UI_FONT}
    fontWeight={UI_LABEL_WEIGHT}
    letterSpacing={UI_LABEL_TRACKING}
  >
    IMAGE
  </text>
)

export const ImagePreview = memo(function ImagePreview({ widget, w, h }: BaseRendererProps) {
  if (widget.config.type !== 'image') return null
  return (
    <svg width={w} height={h} className="block overflow-hidden" aria-hidden="true">
      <rect
        x={4}
        y={4}
        width={Math.max(0, w - 8)}
        height={Math.max(0, h - 8)}
        fill={FRAME_BG}
        rx={3}
        stroke={FRAME_STROKE}
      />
      <polyline points={mountainPoints(w, h)} fill="none" stroke={GLYPH_STROKE} strokeWidth={1.5} />
      <circle cx={w * 0.3} cy={h * 0.35} r={Math.min(w, h) * 0.06} fill={GLYPH_STROKE} />
      <ImageCaption w={w} h={h} />
    </svg>
  )
})
