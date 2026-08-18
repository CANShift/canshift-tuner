import type { ChangeTag, ChangelogEntry } from '../../lib/firmware/changelog'

export interface ChangelogPanelProps {
  version: string
  publishedAt: string
  notesUrl: string
  entries: readonly ChangelogEntry[]
}

const TAG_TONES: Record<ChangeTag, string> = {
  ADD: 'text-ui-accent',
  FIX: 'text-ui-ink',
  CHG: 'text-ui-faint',
}

const EMPTY = 'This release ships without written notes.'

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export const ChangelogPanel = ({
  version,
  publishedAt,
  notesUrl,
  entries,
}: ChangelogPanelProps) => (
  <section className="border-t-2 border-ui-rule pt-4">
    <div className="flex flex-wrap items-baseline gap-4 pb-4">
      <span className="font-mono text-[10.5px] tracking-[0.2em] text-ui-muted">
        CHANGELOG {version}
      </span>
      <span className="font-mono text-[11.5px] text-ui-faint">{formatDate(publishedAt)}</span>
      <a
        href={notesUrl}
        target="_blank"
        rel="noreferrer"
        className="ml-auto font-mono text-[11.5px] text-ui-muted no-underline hover:text-ui-ink"
      >
        All releases ↗
      </a>
    </div>

    {entries.length === 0 ? (
      <p className="text-[13px] text-ui-faint">{EMPTY}</p>
    ) : (
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {entries.map((entry) => (
          <li key={entry.text} className="flex gap-4 text-[13.5px] leading-[1.5] text-ui-ink">
            <span
              className={`shrink-0 pt-px font-mono text-[10.5px] tracking-[0.14em] ${TAG_TONES[entry.tag]}`}
            >
              {entry.tag}
            </span>
            <span className="text-pretty">{entry.text}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
)
