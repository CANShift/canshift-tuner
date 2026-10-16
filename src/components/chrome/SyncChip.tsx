import { cn } from '@/lib/utils'
import { STRINGS } from '../../strings'
import { useChanges } from '../../hooks/useChanges'
import { useUiStore } from '../../stores/ui.store'
import { UiIcon } from '../icons/UiIcons'
import { StatusDot } from './StatusDot'

export interface SyncChipProps {
  variant: 'chip' | 'text'
}

const VARIANT = {
  chip: 'h-11 rounded-full border border-app-border bg-app-surface px-3.5',
  text: 'h-11 rounded-control px-3 hover:bg-app-surface-2',
}

export const SyncChip = ({ variant }: SyncChipProps) => {
  const count = useChanges().length
  const open = useUiStore((s) => s.setNotSentOpen)
  const synced = count === 0
  return (
    <button
      type="button"
      disabled={synced}
      onClick={() => {
        open(true)
      }}
      className={cn(
        'inline-flex items-center gap-2 text-sm text-app-text disabled:cursor-default',
        VARIANT[variant]
      )}
    >
      {synced ? (
        <UiIcon name="check" className="size-4 text-app-success" />
      ) : (
        <StatusDot tone="warning" />
      )}
      {synced ? STRINGS.sync.onTheDash : STRINGS.sync.notSent(count)}
    </button>
  )
}
