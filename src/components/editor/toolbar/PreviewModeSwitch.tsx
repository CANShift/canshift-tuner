import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  PREVIEW_LABELS,
  PREVIEW_MODES,
  PREVIEW_TITLES,
  type PreviewMode,
} from '../preview/preview-modes'

export interface PreviewModeSwitchProps {
  mode: PreviewMode
  onMode: (mode: PreviewMode) => void
}

const segment = cva(
  'cursor-pointer whitespace-nowrap border border-ui-ink px-3 py-[7px] text-[12.5px]',
  {
    variants: {
      active: {
        true: 'bg-ui-rule font-bold text-ui-bg',
        false: 'bg-transparent text-ui-muted hover:bg-ui-panel hover:text-ui-ink',
      },
    },
    defaultVariants: { active: false },
  }
)

export const PreviewModeSwitch = ({ mode, onMode }: PreviewModeSwitchProps) => (
  <div className="flex items-center gap-2.5">
    <span className="text-[12.5px] text-ui-muted">Preview</span>
    <div className="flex gap-px">
      {PREVIEW_MODES.map((candidate) => (
        <button
          key={candidate}
          type="button"
          onClick={() => {
            onMode(candidate)
          }}
          title={PREVIEW_TITLES[candidate]}
          aria-pressed={candidate === mode}
          className={cn(segment({ active: candidate === mode }))}
        >
          {PREVIEW_LABELS[candidate]}
        </button>
      ))}
    </div>
  </div>
)
