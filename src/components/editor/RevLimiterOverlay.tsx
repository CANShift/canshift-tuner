import { cn } from '@/lib/utils'

const REV_LIMIT_BORDER_PX = 8

const OVERLAY = [
  'pointer-events-none absolute inset-0 z-[200] flex items-center justify-center',
  'border-solid border-[#FF0000] [transition:opacity_0.1s]',
].join(' ')

export interface RevLimiterOverlayProps {
  canvasW: number
  flashPhase: boolean
  scale: number
}

export const RevLimiterOverlay = ({ canvasW, flashPhase, scale }: RevLimiterOverlayProps) => {
  return (
    <div
      className={cn(OVERLAY, flashPhase ? 'opacity-100' : 'opacity-50')}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ borderWidth: Math.round(REV_LIMIT_BORDER_PX * scale) }}
    >
      <svg width={canvasW * 0.28} height={canvasW * 0.28} viewBox="0 0 100 100">
        <polygon
          points="50,8 96,90 4,90"
          fill="none"
          stroke="#FF4444"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="80"
          textAnchor="middle"
          fill="#FF4444"
          fontSize="52"
          fontWeight="900"
          fontFamily="monospace"
        >
          !
        </text>
      </svg>
    </div>
  )
}
