import type { RubberBand } from '../../../hooks/useRubberBandSelection'

export interface RubberBandRectProps {
  rubberBand: RubberBand | null
  effScale: number
}

export const RubberBandRect = ({ rubberBand, effScale }: RubberBandRectProps) => {
  if (!rubberBand) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: rubberBand.x * effScale,
        top: rubberBand.y * effScale,
        width: Math.max(0, rubberBand.w * effScale),
        height: Math.max(0, rubberBand.h * effScale),
        border: '1px solid #6688FF',
        background: '#3344FF18',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  )
}
