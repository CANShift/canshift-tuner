import type { CSSProperties } from 'react'
import { CS_DANGER, CS_WARN } from './preview-modes'

const RULE_PX = 1
const NAME_PX = 7
const DETAIL_PX = 7
const PADDING_PX = 4
const TRACKING = '0.16em'
const NAME_CLASS = 'font-sans font-extrabold uppercase'

export interface CutBandProps {
  scale: number
  dimColor: string
  inkColor: string
  name: string
  detail: string
  elapsed: string
  protective: boolean
}

interface CutTextProps {
  fontSize: number
  color: string
  text: string
  className?: string
  letterSpacing?: string
}

const CutText = ({ fontSize, color, text, className, letterSpacing }: CutTextProps) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <span className={className} style={{ fontSize, letterSpacing, color }}>
    {text}
  </span>
)

const bandStyle = (scale: number, tone: string): CSSProperties => ({
  borderTop: `${String(RULE_PX * scale)}px solid ${tone}`,
  paddingTop: PADDING_PX * scale,
  gap: 7 * scale,
})

export const CutBand = ({
  scale,
  dimColor,
  inkColor,
  name,
  detail,
  elapsed,
  protective,
}: CutBandProps) => {
  const tone = protective ? CS_DANGER : CS_WARN
  const detailPx = DETAIL_PX * scale
  return (
    <div
      className="flex shrink-0 items-baseline"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={bandStyle(scale, tone)}
    >
      <CutText
        className={NAME_CLASS}
        fontSize={NAME_PX * scale}
        letterSpacing={TRACKING}
        color={tone}
        text={name}
      />
      <CutText fontSize={detailPx} color={protective ? inkColor : dimColor} text={detail} />
      <CutText className="ml-auto" fontSize={detailPx} color={dimColor} text={elapsed} />
    </div>
  )
}
