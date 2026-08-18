import { cn } from '@/lib/utils'
import type { ProfileChange } from '../../hooks/useProfileChange'

export interface ProfileStripProps {
  change: ProfileChange
  onApply: () => void
  onDismiss: () => void
}

type StripKind = 'pending' | 'applied' | 'error'

const BORDER: Record<StripKind, string> = {
  pending: 'border-l-ui-accent',
  applied: 'border-l-ui-ok',
  error: 'border-l-ui-danger',
}

const BUTTON =
  'cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-[12.5px] font-bold tracking-[0.04em]'

const warningLabel = (count: number): string =>
  `${String(count)} parser warning${count === 1 ? '' : 's'}`

export const ProfileStrip = ({ change, onApply, onDismiss }: ProfileStripProps) => {
  if (change.kind === 'idle') return null
  const warnings = change.kind === 'pending' ? change.warnings : []

  return (
    <div
      role="status"
      aria-label="Profile change"
      className={cn(
        'flex shrink-0 items-center gap-4 border-b border-l-[3px] border-b-ui-line bg-ui-panel',
        'px-6 py-[9px] font-mono text-[12.5px] text-ui-ink',
        BORDER[change.kind]
      )}
    >
      <span className="min-w-0 flex-1 truncate" title={change.message}>
        {change.message}
      </span>

      {warnings.length > 0 && (
        <span className="shrink-0 text-ui-warning" title={warnings.join('\n')}>
          {warningLabel(warnings.length)}
        </span>
      )}

      {change.kind === 'pending' && (
        <button type="button" onClick={onApply} className={cn(BUTTON, 'text-ui-accent')}>
          Apply
        </button>
      )}

      <button type="button" onClick={onDismiss} className={cn(BUTTON, 'text-ui-muted')}>
        {change.kind === 'pending' ? 'Cancel' : 'Dismiss'}
      </button>
    </div>
  )
}
