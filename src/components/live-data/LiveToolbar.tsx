import { cn } from '@/lib/utils'

type RecordState = 'idle' | 'recording'

const RECORD_LABEL: Record<RecordState, string> = { idle: 'RECORD', recording: 'STOP & SAVE' }

const RECORD_FACE: Record<RecordState, string> = {
  idle: 'border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel',
  recording: 'border-ui-accent bg-ui-accent text-white hover:bg-ui-accent-hover',
}

const BUTTON = 'cursor-pointer whitespace-nowrap border px-4 py-[9px] text-[12.5px] font-bold'

export interface LiveToolbarProps {
  meta: string
  recording: boolean
  recordedCount: number
  paused: boolean
  onRecord: () => void
  onTogglePause: () => void
}

export const LiveToolbar = ({
  meta,
  recording,
  recordedCount,
  paused,
  onRecord,
  onTogglePause,
}: LiveToolbarProps) => {
  const recordState: RecordState = recording ? 'recording' : 'idle'
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ui-rule px-3 py-2 md:h-[54px] md:flex-nowrap md:px-6 md:py-0">
      <span className="font-mono text-[11px] tracking-[0.18em] text-ui-muted">LIVE DATA</span>
      <span className="whitespace-nowrap font-mono text-[11.5px] text-ui-muted">{meta}</span>
      <div className="flex-1" />
      {recording && (
        <span className="whitespace-nowrap font-mono text-[11px] text-ui-faint">
          {recordedCount} samples
        </span>
      )}
      <button type="button" onClick={onRecord} className={cn(BUTTON, RECORD_FACE[recordState])}>
        {RECORD_LABEL[recordState]}
      </button>
      <button type="button" onClick={onTogglePause} className={cn(BUTTON, RECORD_FACE.idle)}>
        {paused ? 'START' : 'PAUSE'}
      </button>
    </div>
  )
}
