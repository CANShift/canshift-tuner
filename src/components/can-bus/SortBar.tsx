import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type SortKey = 'id' | 'lastSeen' | 'rate' | 'count' | 'activity'

interface SortBarProps {
  sortKey: SortKey
  onChange: (key: SortKey) => void
}

const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: 'id', label: 'ID' },
  { key: 'lastSeen', label: 'LAST SEEN' },
  { key: 'rate', label: 'RATE' },
  { key: 'count', label: 'COUNT' },
  { key: 'activity', label: 'ACTIVITY' },
]

export const SortBar = ({ sortKey, onChange }: SortBarProps) => (
  <div className="flex border border-brand-neutral-400" role="group" aria-label="Sort frames by">
    {SORT_OPTIONS.map((o) => (
      <button
        key={o.key}
        type="button"
        aria-pressed={o.key === sortKey}
        onClick={() => {
          onChange(o.key)
        }}
        className={cn(segment({ active: o.key === sortKey }))}
      >
        {o.label}
      </button>
    ))}
  </div>
)

const segment = cva(
  'cursor-pointer border-none px-3 py-[5px] text-[11px] font-extrabold tracking-[0.08em]',
  {
    variants: {
      active: {
        true: 'bg-brand-text text-brand-chrome-bg',
        false: 'bg-transparent text-brand-neutral-700',
      },
    },
    defaultVariants: { active: false },
  }
)
