import type { RubberBand } from '../../../hooks/useRubberBandSelection'

export interface RubberBandRectProps {
  rubberBand: RubberBand | null
  effScale: number
}

const RECT =
  'pointer-events-none absolute z-[100] border border-solid border-[#6688FF] bg-[#3344FF18]'

export const RubberBandRect = ({ rubberBand, effScale }: RubberBandRectProps) => {
  if (!rubberBand) return null
  return (
    <div
      className={RECT}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        left: rubberBand.x * effScale,
        top: rubberBand.y * effScale,
        width: Math.max(0, rubberBand.w * effScale),
        height: Math.max(0, rubberBand.h * effScale),
      }}
    />
  )
}
