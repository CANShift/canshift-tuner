import type { SignalDef, Widget, WidgetType } from '@canshift/core'
import { cn } from '@/lib/utils'
import { PALETTE_ITEMS } from '../../lib/new-widget'

const GRID = 'grid grid-cols-[minmax(0,1fr)_96px_84px] gap-2.5'
const TYPE_OPTIONS = PALETTE_ITEMS.map((item) => item.type)
const SIGNAL_LIST_ID = 'cs-signals'

export interface WidgetListProps {
  widgets: readonly Widget[]
  signals: readonly SignalDef[]
  selectedId: string | null
  onSelect: (widgetId: string) => void
  onSignal: (widgetId: string, signal: string) => void
  onType: (widgetId: string, type: WidgetType) => void
  labelFor: (widget: Widget) => string
}

export const WidgetList = ({
  widgets,
  signals,
  selectedId,
  onSelect,
  onSignal,
  onType,
  labelFor,
}: WidgetListProps) => (
  <>
    <datalist id={SIGNAL_LIST_ID}>
      {signals.map((signal) => (
        <option key={signal.name} value={signal.name} />
      ))}
    </datalist>

    <div
      className={cn(
        GRID,
        'shrink-0 border-b-2 border-ui-rule px-4 py-3',
        'font-mono text-[10px] tracking-[0.16em] text-ui-muted'
      )}
    >
      <span>WIDGET</span>
      <span>SIGNAL</span>
      <span>TYPE</span>
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto">
      {widgets.length === 0 && (
        <p className="px-4 py-3.5 text-[12px] text-ui-faint">No widgets on this page yet.</p>
      )}
      {widgets.map((widget) => {
        const selected = widget.id === selectedId
        return (
          <div
            key={widget.id}
            onClick={() => {
              onSelect(widget.id)
            }}
            role="row"
            className={cn(
              GRID,
              'cursor-pointer items-center border-b border-ui-line px-4 py-[11px]',
              selected ? 'bg-ui-header-bg text-ui-header-ink' : 'hover:bg-ui-panel'
            )}
          >
            <button
              type="button"
              onClick={() => {
                onSelect(widget.id)
              }}
              className="cursor-pointer truncate border-0 bg-transparent p-0 text-left font-mono text-[13px] font-bold text-inherit"
            >
              {labelFor(widget)}
            </button>
            <input
              list={SIGNAL_LIST_ID}
              value={widget.signal}
              aria-label={`Signal for ${labelFor(widget)}`}
              spellCheck={false}
              onChange={(e) => {
                onSignal(widget.id, e.target.value)
              }}
              onFocus={() => {
                onSelect(widget.id)
              }}
              className="w-full border border-ui-line bg-transparent px-1 py-[3px] font-mono text-[13px] text-inherit outline-none"
            />
            <select
              value={widget.type}
              aria-label={`Type for ${labelFor(widget)}`}
              onChange={(e) => {
                onType(widget.id, e.target.value as WidgetType)
              }}
              onFocus={() => {
                onSelect(widget.id)
              }}
              className="border-0 bg-transparent py-0.5 font-mono text-[12.5px] text-inherit"
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  </>
)
