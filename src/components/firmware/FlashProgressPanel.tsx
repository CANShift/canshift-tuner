import { cn } from '@/lib/utils'
import type { FlashProgress, FlashStepStatus } from '../../lib/firmware/flash-steps'

export interface FlashProgressPanelProps {
  progress: FlashProgress
}

const DO_NOT_UNPLUG = 'DO NOT UNPLUG'
const WARNING_COLOUR = 'text-[#ff8800]'

const MARKS: Record<FlashStepStatus, string> = {
  done: '✓',
  running: '›',
  pending: '·',
}

const STEP_TONES: Record<FlashStepStatus, string> = {
  done: 'text-ui-muted',
  running: 'text-ui-ink',
  pending: 'text-ui-faint',
}

export const FlashProgressPanel = ({ progress }: FlashProgressPanelProps) => (
  <div className="mb-9">
    <div className="bg-ui-header-bg px-7 py-6">
      <div className="flex items-baseline justify-between gap-6">
        <span className="font-mono text-[10.5px] tracking-[0.18em] text-ui-header-dim">
          {progress.running?.label ?? DO_NOT_UNPLUG}
        </span>
        <span className="font-mono text-[30px] font-bold leading-none text-ui-header-ink tabular-nums">
          {progress.percent.toFixed(0)}%
        </span>
      </div>
      <div className="mt-4 h-[10px] w-full overflow-hidden bg-ui-header-line">
        <div
          className="h-full bg-ui-accent [transition:width_180ms_linear]"
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ width: `${progress.percent.toFixed(1)}%` }}
        />
      </div>
      <p className={cn('mt-4 font-mono text-[11px] font-bold tracking-[0.18em]', WARNING_COLOUR)}>
        {DO_NOT_UNPLUG}
      </p>
    </div>

    <ol className="m-0 flex list-none flex-col gap-2.5 p-0 pt-5">
      {progress.steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            'flex items-center gap-3 font-mono text-[12.5px] tracking-[0.08em]',
            STEP_TONES[step.status]
          )}
        >
          <span aria-hidden className="w-3">
            {MARKS[step.status]}
          </span>
          {step.label}
        </li>
      ))}
    </ol>
  </div>
)
