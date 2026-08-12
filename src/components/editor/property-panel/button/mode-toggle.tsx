import { MAX_CYCLE_STATES } from '@canshift/core'

import { cn } from '@/lib/utils'
import { modePill } from './shared'

interface ModeToggleProps {
  mode: 'single' | 'cycle'
  onChange: (next: 'single' | 'cycle') => void
}

export const ModeToggle = ({ mode, onChange }: ModeToggleProps) => (
  <div className="flex gap-1">
    <button
      className={cn(modePill({ active: mode === 'single' }))}
      onClick={() => {
        onChange('single')
      }}
    >
      Single action
    </button>
    <button
      className={cn(modePill({ active: mode === 'cycle' }))}
      onClick={() => {
        onChange('cycle')
      }}
    >
      Cycle (2–{MAX_CYCLE_STATES} states)
    </button>
  </div>
)
