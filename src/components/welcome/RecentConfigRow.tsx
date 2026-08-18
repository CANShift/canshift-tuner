import type { BenchEntry } from '../../lib/bench-entry'

export interface RecentConfigRowProps {
  entry: BenchEntry
  onOpen: (id: string) => void
  onExport: (id: string, name: string) => void
  onDelete: (id: string) => void
  deletable: boolean
}

const QUIET_ACTION = [
  'cursor-pointer border-0 bg-transparent p-0 font-mono text-[11.5px]',
  'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
  'focus-visible:opacity-100',
].join(' ')

export const RecentConfigRow = ({
  entry,
  onOpen,
  onExport,
  onDelete,
  deletable,
}: RecentConfigRowProps) => (
  <div className="group flex max-w-[440px] items-baseline gap-[18px] border-b border-ui-line py-[15px] pl-0 pr-3 hover:bg-ui-panel">
    <button
      type="button"
      onClick={() => {
        onOpen(entry.id)
      }}
      className="flex min-w-0 flex-1 cursor-pointer items-baseline gap-[18px] border-0 bg-transparent p-0 text-left"
    >
      <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ui-ink">
        {entry.name}
      </span>
      <span className="min-w-0 flex-[0_1_auto] truncate font-mono text-[11.5px] text-ui-muted">
        {entry.meta}
      </span>
      <span className="font-mono text-[11.5px] text-ui-accent">OPEN</span>
    </button>
    <button
      type="button"
      onClick={() => {
        onExport(entry.id, entry.name)
      }}
      title={`Export ${entry.name} as a .canshift file`}
      className={`${QUIET_ACTION} text-ui-muted hover:text-ui-ink`}
    >
      export
    </button>
    {deletable && (
      <button
        type="button"
        onClick={() => {
          onDelete(entry.id)
        }}
        title={`Delete ${entry.name} from this browser`}
        className={`${QUIET_ACTION} text-ui-accent`}
      >
        delete
      </button>
    )}
  </div>
)
