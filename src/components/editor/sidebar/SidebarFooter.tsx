import type { Widget } from '@canshift/core'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useSignalStore } from '../../../stores/signal.store'
import { preflightRefusals } from '../../../lib/sync/preflight'

const FITS = 'layout fits'

const PASTE =
  'cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-3 py-1.5 font-sans text-[12px] font-bold text-ui-ink hover:bg-ui-panel'
const REMOVE =
  'ml-auto cursor-pointer whitespace-nowrap border border-ui-accent bg-transparent px-3 py-1.5 font-sans text-[12px] font-bold text-ui-accent disabled:cursor-not-allowed disabled:border-ui-line disabled:text-ui-faint'

const VerdictLabel = () => {
  const config = useDashboardStore((s) => s.config)
  const signals = useSignalStore((s) => s.signals)
  const issues =
    config === null ? 0 : preflightRefusals({ config, signals, firmwareMismatch: false }).length
  return (
    <span className={cn(issues === 0 ? 'text-ui-muted' : 'text-ui-warning')}>
      {issues === 0 ? FITS : `${String(issues)} to fix`}
    </span>
  )
}

const PasteButton = ({ pageId }: { pageId: string }) => {
  const clipboardCount = useDashboardStore((s) => s.clipboardWidgets.length)
  const pasteWidgets = useDashboardStore((s) => s.pasteWidgets)
  if (clipboardCount === 0) return null
  return (
    <button type="button" onClick={() => pasteWidgets(pageId)} className={PASTE}>
      Paste {clipboardCount}
    </button>
  )
}

export interface SidebarFooterProps {
  pageId: string
  selected: Widget | null
}

export const SidebarFooter = ({ pageId, selected }: SidebarFooterProps) => {
  const pageCount = useDashboardStore((s) => s.config?.pages.length ?? 0)
  const removeWidget = useDashboardStore((s) => s.removeWidget)
  return (
    <div className="flex shrink-0 items-center gap-3.5 border-t border-ui-line px-4 py-[13px] font-mono text-[11.5px] text-ui-muted">
      <VerdictLabel />
      <span className="text-ui-faint">wheel {pageCount} pages</span>
      <PasteButton pageId={pageId} />
      <button
        type="button"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null) removeWidget(pageId, selected.id)
        }}
        className={REMOVE}
      >
        Remove
      </button>
    </div>
  )
}
