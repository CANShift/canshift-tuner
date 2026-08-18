import { cn } from '@/lib/utils'

export interface VersionOption {
  tag: string
  label: string
}

export interface VersionRowProps {
  options: readonly VersionOption[]
  selectedTag: string
  actionLabel: string
  actionDisabled: boolean
  actionTitle?: string | undefined
  note: string
  rollback: string | null
  onSelect: (tag: string) => void
  onAction: () => void
}

export const VersionRow = ({
  options,
  selectedTag,
  actionLabel,
  actionDisabled,
  actionTitle,
  note,
  rollback,
  onSelect,
  onAction,
}: VersionRowProps) => (
  <section className="mb-8">
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={selectedTag}
        aria-label="Firmware version"
        onChange={(e) => {
          onSelect(e.target.value)
        }}
        className="border-2 border-ui-rule bg-ui-bg py-[11px] pl-3 pr-8 font-mono text-[14px] font-bold text-ui-ink"
      >
        {options.map((option) => (
          <option key={option.tag} value={option.tag}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={actionDisabled}
        title={actionTitle}
        onClick={onAction}
        className={cn(
          'whitespace-nowrap border-0 px-[22px] py-[15px] text-[13px] font-extrabold tracking-[0.09em]',
          actionDisabled
            ? 'cursor-not-allowed bg-ui-line text-ui-faint'
            : 'cursor-pointer bg-ui-accent text-white hover:bg-ui-accent-hover'
        )}
      >
        {actionLabel}
      </button>
    </div>
    <p className="mt-3.5 text-[13px] text-ui-muted">{note}</p>
    {rollback !== null && (
      <p className="mt-3.5 border-l-[3px] border-l-ui-warning py-1 pl-3.5 text-[13px] text-ui-ink">
        {rollback}
      </p>
    )}
  </section>
)
