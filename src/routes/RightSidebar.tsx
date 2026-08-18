import { lazy, Suspense, useState } from 'react'
import type { Widget } from '@canshift/core'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { WidgetList } from '../components/editor/WidgetList'
import { SelectedWidgetEditor } from '../components/editor/SelectedWidgetEditor'
import { RouteLoading } from '../components/shell/RouteLoading'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useDisplayUnits } from '../hooks/useDisplayUnits'
import { configVerdict } from '../lib/burn-verdict'
import { displayLabelForSignal } from '../utils/signal-labels'
import { retypeWidget, type PaletteWidgetType } from '../lib/new-widget'

const PropertyPanel = lazy(() => import('../components/editor/PropertyPanel'))

const FITS = 'layout fits'

const widgetLabel = (widget: Widget): string => {
  if (widget.config.type === 'button') return widget.config.kicker ?? widget.config.label
  if (widget.signal.length > 0) return displayLabelForSignal(widget.signal).toUpperCase()
  return widget.type.toUpperCase()
}

const ENTRY_DECIMALS = 2

const roundForEntry = (value: number): number =>
  Math.round(value * 10 ** ENTRY_DECIMALS) / 10 ** ENTRY_DECIMALS

const dangerOf = (widget: Widget): { at: number | null; below: boolean; editable: boolean } => {
  if (widget.config.type !== 'gauge') return { at: null, below: false, editable: false }
  return {
    at: widget.config.dangerLevel,
    below: widget.config.dangerBelow === true,
    editable: true,
  }
}

export interface RightSidebarProps {
  pageId: string | undefined
}

export const RightSidebar = ({ pageId }: RightSidebarProps) => {
  const config = useDashboardStore((s) => s.config)
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  const clipboardCount = useDashboardStore((s) => s.clipboardWidgets.length)
  const signals = useSignalStore((s) => s.signals)
  const units = useDisplayUnits()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const { selectWidget, updateWidget, reorderWidget, removeWidget, pasteWidgets } =
    useDashboardStore(
      useShallow((s) => ({
        selectWidget: s.selectWidget,
        updateWidget: s.updateWidget,
        reorderWidget: s.reorderWidget,
        removeWidget: s.removeWidget,
        pasteWidgets: s.pasteWidgets,
      }))
    )

  const page = config?.pages.find((candidate) => candidate.id === pageId)
  if (!page || pageId === undefined) return <aside className={ASIDE} />

  const widgets = page.widgets
  const selected = widgets.find((widget) => widget.id === selectedWidgetId) ?? null
  const index = selected === null ? -1 : widgets.indexOf(selected)
  const verdict = configVerdict(config, signals)
  const danger = selected === null ? null : dangerOf(selected)
  const selectedUnit = signals.find((signal) => signal.name === selected?.signal)?.unit ?? ''

  return (
    <aside className={ASIDE}>
      <WidgetList
        widgets={widgets}
        signals={signals}
        selectedId={selectedWidgetId}
        onSelect={selectWidget}
        onSignal={(widgetId, signal) => {
          updateWidget(pageId, widgetId, { signal })
        }}
        onType={(widgetId, type) => {
          const target = widgets.find((widget) => widget.id === widgetId)
          if (!target) return
          const patch = retypeWidget(target, type as PaletteWidgetType)
          if (patch !== null) updateWidget(pageId, widgetId, patch)
        }}
        labelFor={widgetLabel}
      />

      {selected !== null && danger !== null && (
        <SelectedWidgetEditor
          widget={selected}
          name={widgetLabel(selected)}
          nameEditable={selected.config.type === 'button'}
          onName={(name) => {
            if (selected.config.type !== 'button') return
            updateWidget(pageId, selected.id, { config: { ...selected.config, kicker: name } })
          }}
          onMove={(direction) => {
            reorderWidget(pageId, selected.id, direction)
          }}
          canMoveUp={index > 0}
          canMoveDown={index >= 0 && index < widgets.length - 1}
          dangerAt={
            danger.at === null ? null : roundForEntry(units.valueOf(danger.at, selectedUnit))
          }
          dangerBelow={danger.below}
          dangerEditable={danger.editable}
          onDangerAt={(value) => {
            if (selected.config.type !== 'gauge' || value === null) return
            updateWidget(pageId, selected.id, {
              config: {
                ...selected.config,
                dangerLevel: units.storedValueOf(value, selectedUnit),
              },
            })
          }}
          onDangerBelow={(below) => {
            if (selected.config.type !== 'gauge') return
            updateWidget(pageId, selected.id, {
              config: { ...selected.config, dangerBelow: below },
            })
          }}
        />
      )}

      <div className="flex shrink-0 items-center gap-3.5 border-t border-ui-line px-4 py-[13px] font-mono text-[11.5px] text-ui-muted">
        <span className={cn(verdict.kind === 'ok' ? 'text-ui-muted' : 'text-ui-warning')}>
          {verdict.kind === 'ok' ? FITS : verdict.kind.replace(/-/g, ' ')}
        </span>
        <span className="text-ui-faint">wheel {config?.pages.length ?? 0} pages</span>
        {clipboardCount > 0 && (
          <button
            type="button"
            onClick={() => {
              pasteWidgets(pageId)
            }}
            className="cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-3 py-1.5 font-sans text-[12px] font-bold text-ui-ink hover:bg-ui-panel"
          >
            Paste {clipboardCount}
          </button>
        )}
        <button
          type="button"
          disabled={selected === null}
          onClick={() => {
            if (selected !== null) removeWidget(pageId, selected.id)
          }}
          className="ml-auto cursor-pointer whitespace-nowrap border border-ui-accent bg-transparent px-3 py-1.5 font-sans text-[12px] font-bold text-ui-accent disabled:cursor-not-allowed disabled:border-ui-line disabled:text-ui-faint"
        >
          Remove
        </button>
      </div>

      <div className="shrink-0 border-t border-ui-line">
        <button
          type="button"
          onClick={() => {
            setAdvancedOpen((open) => !open)
          }}
          className="w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left font-mono text-[11px] text-ui-muted hover:text-ui-ink"
        >
          {advancedOpen ? 'Hide the full properties' : 'Colours, size, per-type config…'}
        </button>
        {advancedOpen && (
          <div className="max-h-[280px] overflow-y-auto border-t border-ui-line">
            <Suspense fallback={<RouteLoading />}>
              <PropertyPanel pageId={pageId} />
            </Suspense>
          </div>
        )}
      </div>
    </aside>
  )
}

const ASIDE = 'flex w-[356px] shrink-0 flex-col overflow-hidden border-l-2 border-ui-rule bg-ui-bg'
