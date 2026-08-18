import { cn } from '@/lib/utils'

export interface BoardProfileRowProps {
  boardName: string | null
  canProvision: boolean
  busy: boolean
  blockedNote: string
  note: string | null
  onProvision: () => void
}

const NO_BOARD = 'Pick a board in the board definition below before writing a profile to the dash.'

export const BoardProfileRow = ({
  boardName,
  canProvision,
  busy,
  blockedNote,
  note,
  onProvision,
}: BoardProfileRowProps) => (
  <div className="mt-4 border-t border-ui-line pt-4">
    <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-0">
        <div className="mb-[3px] font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">
          BOARD PROFILE
        </div>
        <div className="text-[13px] text-ui-faint">
          {boardName === null ? NO_BOARD : `Writes ${boardName} to the dash, which then reboots.`}
        </div>
      </div>
      <button
        type="button"
        disabled={!canProvision}
        title={canProvision ? undefined : blockedNote}
        onClick={onProvision}
        className={cn(
          'ml-auto shrink-0 whitespace-nowrap border px-4 py-2 text-[12.5px] font-bold',
          canProvision
            ? 'cursor-pointer border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel'
            : 'cursor-not-allowed border-ui-line bg-transparent text-ui-faint'
        )}
      >
        {busy ? 'WRITING…' : 'WRITE PROFILE'}
      </button>
    </div>
    {note !== null && <p className="mt-3 text-[13px] leading-[1.5] text-ui-muted">{note}</p>}
  </div>
)
