import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ActiveBar } from '@/components/ui/active-bar'
import { useDashboardStore } from '../../stores/dashboard.store'

interface WidgetListPanelProps {
  pageId: string
}

const WidgetListPanel = ({ pageId }: WidgetListPanelProps) => {
  const pages = useDashboardStore((s) => s.config?.pages)
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  const selectWidget = useDashboardStore((s) => s.selectWidget)

  const pageIndex = pages?.findIndex((p) => p.id === pageId) ?? -1
  const page = pageIndex >= 0 ? pages?.[pageIndex] : undefined
  if (!page) return null

  return (
    <div className={PANEL}>
      <div className={HEADER}>
        <span>PAGE {pageIndex + 1}</span>
        <span>
          {page.widgets.length} widget{page.widgets.length === 1 ? '' : 's'}
        </span>
      </div>
      {page.widgets.length === 0 && <div className={EMPTY}>No widgets on this page yet.</div>}
      {page.widgets.map((widget, index) => {
        const selected = widget.id === selectedWidgetId
        return (
          <button
            key={widget.id}
            type="button"
            className={cn(!selected && 'shell-nav-item', row({ selected }))}
            onClick={() => {
              selectWidget(widget.id)
            }}
          >
            {selected && <ActiveBar />}
            <span className={INDEX}>{String(index + 1).padStart(2, '0')}</span>
            <span className="text-[13px]">{widget.type}</span>
            <span className={SIGNAL}>{widget.signal || '—'}</span>
          </button>
        )
      })}
    </div>
  )
}

const PANEL = 'flex-1 overflow-y-auto'

const HEADER = [
  'flex justify-between px-4 py-3',
  'border-b-2 border-solid border-brand-divider',
  'text-[10px] font-extrabold tracking-[0.18em] text-brand-neutral-600',
].join(' ')

const EMPTY = 'px-4 py-3.5 text-[12px] text-brand-neutral-500'

const row = cva(
  [
    'relative flex w-full cursor-pointer items-center gap-[9px] py-[9px] pl-[19px] pr-4',
    'border-0 border-b border-solid border-brand-neutral-200 text-left',
  ].join(' '),
  {
    variants: {
      selected: {
        true: 'bg-brand-neutral-200 text-brand-text',
        false: 'bg-transparent text-brand-neutral-700',
      },
    },
    defaultVariants: { selected: false },
  }
)

const INDEX = 'w-5 shrink-0 font-mono text-[10px] text-brand-neutral-600'

const SIGNAL = 'ml-auto font-mono text-[10px] text-brand-neutral-600'

export default WidgetListPanel
