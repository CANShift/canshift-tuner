import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { LiveSession } from '../../hooks/useLiveSession'

type RecordState = 'idle' | 'recording'

const RECORD_LABEL: Record<RecordState, string> = { idle: 'Record', recording: 'Stop & save' }

const control = cva(
  'cursor-pointer whitespace-nowrap border px-3 py-[7px] text-[12.5px] font-bold',
  {
    variants: {
      state: {
        idle: 'border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel',
        recording: 'border-ui-accent bg-ui-accent text-white hover:bg-ui-accent-hover',
      },
    },
    defaultVariants: { state: 'idle' },
  }
)

const STEP =
  'grid size-[30px] cursor-pointer place-items-center border border-ui-line-strong bg-transparent font-mono text-[14px] text-ui-ink hover:bg-ui-panel'

const WindowStepper = ({ session }: { session: LiveSession }) => (
  <span className="flex items-center gap-1.5 text-[12.5px] text-ui-muted">
    <button
      type="button"
      aria-label="Longer window"
      className={STEP}
      onClick={() => session.stepWindow(-1)}
    >
      −
    </button>
    <span className="min-w-[38px] text-center font-mono tabular-nums text-ui-ink">
      {session.windowSeconds} s
    </span>
    <button
      type="button"
      aria-label="Shorter window"
      className={STEP}
      onClick={() => session.stepWindow(1)}
    >
      +
    </button>
  </span>
)

export const LiveControls = ({ session }: { session: LiveSession }) => {
  const recordState: RecordState = session.recording ? 'recording' : 'idle'
  return (
    <span className="flex items-center gap-2">
      <WindowStepper session={session} />
      <button type="button" onClick={session.togglePause} className={cn(control())}>
        {session.paused ? 'Resume' : 'Pause'}
      </button>
      <button
        type="button"
        onClick={session.toggleRecording}
        className={cn(control({ state: recordState }))}
      >
        {RECORD_LABEL[recordState]}
        {session.recording ? ` · ${String(session.recordedCount)}` : ''}
      </button>
    </span>
  )
}
