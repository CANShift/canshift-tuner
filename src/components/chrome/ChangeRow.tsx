import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import type { Change } from '../../lib/sync/change'

export interface ChangeRowProps {
  change: Change
  onUndo: (change: Change) => void
}

export const ChangeRow = ({ change, onUndo }: ChangeRowProps) => (
  <li className="flex min-h-16 items-center gap-3 border-b border-app-divider py-2 pl-3.5 pr-3 last:border-b-0">
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-xs text-app-muted">{change.where}</span>
      <span className="text-[15px]">{change.what}</span>
      {change.was.length > 0 && <span className="text-[13px] text-app-muted">{change.was}</span>}
    </div>
    {change.revert.kind !== 'whole' && (
      <Button
        variant="outline"
        className="px-3 text-sm"
        onClick={() => {
          onUndo(change)
        }}
      >
        {STRINGS.sync.undo}
      </Button>
    )}
  </li>
)
