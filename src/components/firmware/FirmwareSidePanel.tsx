import type { ReleaseInfo } from '@canshift/core'
import { useFlashHistoryStore } from '../../stores/flash-history.store'
import { cn } from '@/lib/utils'
import { Eyebrow } from '../ui/meta-text'

export interface FirmwareSidePanelProps {
  release: ReleaseInfo | null
}

const NOTE_MAX_LINES = 12

const noteLines = (notes: string): string[] =>
  notes
    .split('\n')
    .map((line) => line.replace(/^[-*#>\s]+/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, NOTE_MAX_LINES)

const formatHistoryDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toISOString().slice(5, 10).replace('-', '/')
}

export const FirmwareSidePanel = ({ release }: FirmwareSidePanelProps) => {
  const history = useFlashHistoryStore((s) => s.entries)
  const lines = release ? noteLines(release.notes) : []

  return (
    <aside className="flex min-h-0 w-[392px] shrink-0 flex-col border-l-2 border-brand-divider bg-brand-neutral-100">
      <Eyebrow className={SECTION_HEADER}>
        {release ? `CHANGELOG ${release.tag}` : 'CHANGELOG'}
      </Eyebrow>
      <div className="flex max-h-[45%] flex-col gap-3.5 overflow-y-auto border-b-2 border-brand-divider px-6 py-[18px] text-[13px] text-brand-neutral-700">
        {lines.length === 0 && (
          <div className={EMPTY}>
            {release ? 'This release has no notes.' : 'Pick a build to see its release notes.'}
          </div>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'border-l-2 pl-[13px]',
              i === 0 ? 'border-brand-accent' : 'border-brand-neutral-400'
            )}
          >
            {line}
          </div>
        ))}
      </div>
      <Eyebrow className={SECTION_HEADER}>FLASH HISTORY</Eyebrow>
      <div className="flex-1 overflow-y-auto font-mono text-[12px] text-brand-neutral-700">
        {history.length === 0 && <div className={EMPTY}>No flashes from this browser yet.</div>}
        {history.map((entry, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-brand-neutral-300 px-6 py-[11px]"
          >
            <span>{entry.label}</span>
            <span>
              {formatHistoryDate(entry.at)} ·{' '}
              {entry.ok ? 'ok' : <span className="text-brand-accent">failed</span>}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}

const SECTION_HEADER = 'block border-b-2 border-brand-divider px-6 pb-[13px] pt-4 tracking-[0.2em]'

const EMPTY = 'text-[12px] text-brand-neutral-500'
