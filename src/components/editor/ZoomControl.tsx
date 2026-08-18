import { cn } from '@/lib/utils'

export const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2] as const

export interface ZoomControlProps {
  zoom: number
  onStep: (direction: 1 | -1) => void
  onReset: () => void
}

const PERCENT = 100
const MIN = ZOOM_STEPS[0]
const MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1] ?? 2

const STEP_BUTTON = [
  'grid size-6 place-items-center border border-ui-line-strong bg-transparent',
  'font-mono text-[14px] leading-none text-ui-ink',
  'disabled:cursor-not-allowed disabled:text-ui-faint',
].join(' ')

export const ZoomControl = ({ zoom, onStep, onReset }: ZoomControlProps) => (
  <div className="flex items-center gap-2.5">
    <button
      type="button"
      onClick={() => {
        onStep(-1)
      }}
      disabled={zoom <= MIN}
      title="Zoom out"
      aria-label="Zoom out"
      className={cn(STEP_BUTTON, zoom > MIN && 'cursor-pointer hover:bg-ui-panel')}
    >
      −
    </button>
    <button
      type="button"
      onClick={onReset}
      title="Reset zoom"
      className="min-w-[42px] cursor-pointer border-0 bg-transparent text-right font-mono text-[11.5px] tracking-[0.08em] text-ui-ink"
    >
      {Math.round(zoom * PERCENT)} %
    </button>
    <button
      type="button"
      onClick={() => {
        onStep(1)
      }}
      disabled={zoom >= MAX}
      title="Zoom in"
      aria-label="Zoom in"
      className={cn(STEP_BUTTON, zoom < MAX && 'cursor-pointer hover:bg-ui-panel')}
    >
      +
    </button>
  </div>
)
