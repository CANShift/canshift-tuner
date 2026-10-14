import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { PageOpsCluster, type PageOps } from './toolbar/PageOpsCluster'
import { PreviewModeSwitch } from './toolbar/PreviewModeSwitch'
import type { PreviewMode } from './preview/preview-modes'

export interface DashToolbarPage {
  id: string
  label: string
}

export interface WidgetCapacity {
  used: number
  cap: number
  fullNote: string
}

export interface DashToolbarProps {
  pages: readonly DashToolbarPage[]
  selectedPageId: string
  onSelectPage: (id: string) => void
  pageOps: PageOps
  undoTitle: string
  canUndo: boolean
  onUndo: () => void
  previewMode: PreviewMode
  onPreviewMode: (mode: PreviewMode) => void
  capacity: WidgetCapacity
  onAddWidget: () => void
}

const BAR =
  'flex min-h-[54px] shrink-0 flex-wrap items-center gap-x-3.5 gap-y-2 border-b-2 border-ui-rule bg-ui-bg px-3 py-2 md:px-5'

const outline = cva('whitespace-nowrap border px-3.5 py-[9px] text-[12.5px] font-bold', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed border-ui-line bg-transparent text-ui-faint',
      false: 'cursor-pointer border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel',
    },
  },
  defaultVariants: { disabled: false },
})

const primary = cva('whitespace-nowrap border px-4 py-[9px] text-[12.5px] font-bold', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed border-ui-line bg-transparent text-ui-faint',
      false: 'cursor-pointer border-ui-accent bg-ui-accent text-white hover:bg-ui-accent-hover',
    },
  },
  defaultVariants: { disabled: false },
})

interface PageSelectProps {
  pages: readonly DashToolbarPage[]
  selectedPageId: string
  onSelectPage: (id: string) => void
}

const PageSelect = ({ pages, selectedPageId, onSelectPage }: PageSelectProps) => (
  <label className="flex items-center gap-2.5 text-[12.5px] text-ui-muted">
    Page
    <select
      value={selectedPageId}
      onChange={(e) => {
        onSelectPage(e.target.value)
      }}
      className="border-2 border-ui-rule bg-ui-bg py-2 pl-2.5 pr-[30px] font-mono text-[14px] font-bold text-ui-ink"
    >
      {pages.map((page) => (
        <option key={page.id} value={page.id}>
          {page.label}
        </option>
      ))}
    </select>
  </label>
)

interface AddWidgetProps {
  capacity: WidgetCapacity
  onAddWidget: () => void
}

const AddWidget = ({ capacity, onAddWidget }: AddWidgetProps) => {
  const full = capacity.used >= capacity.cap
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-[12.5px] tabular-nums text-ui-muted"
        title="Widgets on this page"
      >
        {capacity.used}/{capacity.cap}
      </span>
      <button
        type="button"
        onClick={onAddWidget}
        disabled={full}
        title={full ? capacity.fullNote : undefined}
        className={cn(primary({ disabled: full }))}
      >
        + Add widget
      </button>
    </div>
  )
}

export const DashToolbar = (props: DashToolbarProps) => (
  <div className={BAR}>
    <PageSelect
      pages={props.pages}
      selectedPageId={props.selectedPageId}
      onSelectPage={props.onSelectPage}
    />
    <PageOpsCluster ops={props.pageOps} />
    <button
      type="button"
      onClick={props.onUndo}
      disabled={!props.canUndo}
      title={props.undoTitle}
      className={cn(outline({ disabled: !props.canUndo }))}
    >
      ↶ Undo
    </button>
    <div className="flex-1" />
    <PreviewModeSwitch mode={props.previewMode} onMode={props.onPreviewMode} />
    <AddWidget capacity={props.capacity} onAddWidget={props.onAddWidget} />
  </div>
)
