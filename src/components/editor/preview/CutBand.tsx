import { CS_DANGER, CS_WARN } from './preview-modes'

const RULE_PX = 1
const NAME_PX = 7
const DETAIL_PX = 7
const PADDING_PX = 4
const TRACKING = '0.16em'

export interface CutBandProps {
  scale: number
  dimColor: string
  inkColor: string
  name: string
  detail: string
  elapsed: string
  protective: boolean
}

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
  return (
    <div
      className="flex shrink-0 items-baseline"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        borderTop: `${String(RULE_PX * scale)}px solid ${tone}`,
        paddingTop: PADDING_PX * scale,
        gap: 7 * scale,
      }}
    >
      <span
        className="font-sans font-extrabold uppercase"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ fontSize: NAME_PX * scale, letterSpacing: TRACKING, color: tone }}
      >
        {name}
      </span>
      <span
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ fontSize: DETAIL_PX * scale, color: protective ? inkColor : dimColor }}
      >
        {detail}
      </span>
      <span
        className="ml-auto"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ fontSize: DETAIL_PX * scale, color: dimColor }}
      >
        {elapsed}
      </span>
    </div>
  )
}
