import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '../../stores/dashboard.store'
import { SensorIcon } from '../icons/SensorIcons'
import { WIDGET_TYPE_DRAG_MIME } from '../../utils/default-widget'
import { buildWidget, PALETTE_ITEMS, type PaletteItem } from '../../lib/new-widget'

interface WidgetPaletteProps {
  pageId: string
}

const WidgetPalette = ({ pageId }: WidgetPaletteProps) => {
  const addWidget = useDashboardStore((s) => s.addWidget)
  const page = useDashboardStore((s) => s.config?.pages.find((p) => p.id === pageId))
  const templateLocked = (page?.template ?? 'custom') !== 'custom'

  const handleAdd = (item: PaletteItem) => {
    if (templateLocked) return
    addWidget(pageId, buildWidget(item))
  }

  return (
    <div className={cn(panel({ locked: templateLocked }))}>
      <div className={HEADER}>
        <span>WIDGET LIBRARY</span>
        <span>{PALETTE_ITEMS.length}</span>
      </div>
      {templateLocked && (
        <div className={LOCKED_NOTE}>
          This page uses a built-in template — widget edits are ignored. Switch the page template
          back to <em>Custom layout</em> to add widgets.
        </div>
      )}
      {PALETTE_ITEMS.map((item) => (
        <button
          key={item.label}
          type="button"
          className={cn(
            !templateLocked && 'shell-nav-item',
            ROW,
            templateLocked && 'cursor-not-allowed'
          )}
          onClick={() => {
            handleAdd(item)
          }}
          draggable={!templateLocked}
          onDragStart={(e) => {
            e.dataTransfer.setData(WIDGET_TYPE_DRAG_MIME, item.type)
            e.dataTransfer.effectAllowed = 'copy'
          }}
          disabled={templateLocked}
          title={templateLocked ? 'Disabled — page uses a template' : `Add ${item.label}`}
        >
          <span className={ROW_ICON}>
            <SensorIcon name={item.icon} size={13} color="currentColor" />
          </span>
          <span className="text-[13px]">{item.label}</span>
          <span className={ROW_SIZE}>
            {item.defaultColSpan}×{item.defaultRowSpan}
          </span>
        </button>
      ))}
    </div>
  )
}

const panel = cva('flex-1 overflow-y-auto', {
  variants: { locked: { true: 'opacity-50', false: 'opacity-100' } },
  defaultVariants: { locked: false },
})

const HEADER = [
  'flex justify-between px-4 py-3',
  'border-b-2 border-solid border-brand-divider',
  'text-[10px] font-extrabold tracking-[0.18em] text-brand-neutral-600',
].join(' ')

const LOCKED_NOTE = [
  'border-b border-solid border-brand-neutral-200 px-4 py-2.5',
  'text-[11px] leading-[1.4] text-brand-neutral-600',
].join(' ')

const ROW = [
  'flex w-full cursor-pointer items-center gap-[9px] px-4 py-[9px]',
  'border-0 border-b border-solid border-brand-neutral-200',
  'bg-transparent text-left text-brand-neutral-700',
].join(' ')

const ROW_ICON = 'inline-flex w-5 shrink-0 text-brand-accent'

const ROW_SIZE = 'ml-auto font-mono text-[10px] text-brand-neutral-600'

export default WidgetPalette
