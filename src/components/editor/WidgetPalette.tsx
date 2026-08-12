import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { WidgetType, SensorIconName } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { SensorIcon } from '../icons/SensorIcons'
import { SIZE_TOKENS } from '../../utils/size-tokens'
import { createId } from '../../utils/id'
import { DEFAULT_WIDGET_STYLE, WIDGET_TYPE_DRAG_MIME } from '../../utils/default-widget'

type PaletteWidgetType = Extract<WidgetType, 'gauge' | 'button' | 'gear' | 'shift_light'>

interface PaletteItem {
  type: PaletteWidgetType
  label: string
  icon: SensorIconName
  defaultSignal: string
  defaultColSpan: number
  defaultRowSpan: number
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'gauge',
    label: 'Gauge',
    icon: 'rpm',
    defaultSignal: 'rpm',
    defaultColSpan: SIZE_TOKENS.XL.colSpan,
    defaultRowSpan: SIZE_TOKENS.XL.rowSpan,
  },
  {
    type: 'button',
    label: 'Button',
    icon: 'cog',
    defaultSignal: '',
    defaultColSpan: SIZE_TOKENS.L.colSpan,
    defaultRowSpan: SIZE_TOKENS.L.rowSpan,
  },
  {
    type: 'gear',
    label: 'Gear',
    icon: 'gear',
    defaultSignal: 'gear',
    defaultColSpan: SIZE_TOKENS.L.colSpan,
    defaultRowSpan: SIZE_TOKENS.L.rowSpan,
  },
  {
    type: 'shift_light',
    label: 'Shift light',
    icon: 'rpm',
    defaultSignal: 'rpm',
    defaultColSpan: 12,
    defaultRowSpan: 1,
  },
]

interface WidgetPaletteProps {
  pageId: string
}

const WidgetPalette = ({ pageId }: WidgetPaletteProps) => {
  const addWidget = useDashboardStore((s) => s.addWidget)
  const page = useDashboardStore((s) => s.config?.pages.find((p) => p.id === pageId))
  const templateLocked = (page?.template ?? 'custom') !== 'custom'

  const handleAdd = (item: PaletteItem) => {
    if (templateLocked) return
    const id = createId(item.type)

    const baseConfig = (() => {
      switch (item.type) {
        case 'gauge':
          return {
            type: 'gauge' as const,
            displayStyle: 'arc' as const,
            minValue: 0,
            maxValue: 8000,
            dangerLevel: 7000,
            decimalPlaces: 0,
            iconName: item.icon,
          }
        case 'button':
          return {
            type: 'button' as const,
            mode: 'single' as const,
            label: 'Button',
            showLabel: true,
            actions: [],
          }
        case 'gear':
          return { type: 'gear' as const, decimalPlaces: 0 as const }
        case 'shift_light':
          return { type: 'shift_light' as const, startValue: 3000, redSegments: 5 }
      }
    })()

    addWidget(pageId, {
      id,
      type: item.type,
      signal: item.defaultSignal,
      layout: {
        col: 0,
        colSpan: item.defaultColSpan,
        row: 0,
        rowSpan: item.defaultRowSpan,
        zOrder: 0,
      },
      style: {
        ...DEFAULT_WIDGET_STYLE,
        fontSize: 16,
      },
      config: baseConfig,
    })
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
