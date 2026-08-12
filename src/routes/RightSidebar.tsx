import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { CollapseRail, CollapseButton } from '../components/shell/CollapseRail'
import { useUiStore } from '../stores/ui.store'

const PropertyPanel = lazy(() => import('../components/editor/PropertyPanel'))
const SignalsPanel = lazy(() => import('../components/editor/SignalsPanel'))
const WidgetPalette = lazy(() => import('../components/editor/WidgetPalette'))
const WidgetListPanel = lazy(() => import('../components/editor/WidgetListPanel'))
const HistoryPanel = lazy(() => import('../components/editor/HistoryPanel'))

type Tab = 'properties' | 'widgets' | 'signals' | 'library' | 'history'

const ASIDE = [
  'flex w-80 shrink-0 flex-row overflow-hidden',
  'min-h-0 border-l-2 border-solid border-brand-divider',
].join(' ')

const GUTTER = [
  'flex shrink-0 flex-col items-center pt-2',
  'border-r border-solid border-brand-divider bg-brand-neutral-100',
].join(' ')

const CONTENT_COL = 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'

const TAB_LIST = 'flex shrink-0 border-b-2 border-solid border-brand-divider'

const tab_ = cva(
  'relative flex-1 cursor-pointer border-0 bg-transparent py-[11px] text-[9px] font-extrabold tracking-[0.06em]',
  {
    variants: { active: { true: 'text-brand-text', false: 'text-brand-neutral-600' } },
    defaultVariants: { active: false },
  }
)

const TAB_BAR = 'absolute bottom-0 left-0 right-0 h-[3px] bg-brand-accent'

const FALLBACK = 'flex flex-1 items-center justify-center text-[11px] text-brand-neutral-500'

const TABS: { id: Tab; label: string }[] = [
  { id: 'properties', label: 'PROPERTIES' },
  { id: 'widgets', label: 'WIDGETS' },
  { id: 'signals', label: 'SIGNALS' },
  { id: 'library', label: 'LIBRARY' },
  { id: 'history', label: 'HISTORY' },
]

export interface RightSidebarProps {
  pageId: string | undefined
}

const PanelFallback = () => <div className={FALLBACK}>Loading…</div>

const TAB_PANELS: Record<Tab, (pageId: string | undefined) => ReactNode | null> = {
  properties: (pageId) => (pageId === undefined ? null : <PropertyPanel pageId={pageId} />),
  widgets: (pageId) => (pageId === undefined ? null : <WidgetListPanel pageId={pageId} />),
  signals: (pageId) => <SignalsPanel pageId={pageId} />,
  library: (pageId) => (pageId === undefined ? null : <WidgetPalette pageId={pageId} />),
  history: () => <HistoryPanel />,
}

export const RightSidebar = ({ pageId }: RightSidebarProps) => {
  const [tab, setTab] = useState<Tab>('properties')
  const collapsed = useUiStore((s) => s.inspectorCollapsed)
  const toggleInspector = useUiStore((s) => s.toggleInspector)

  if (collapsed) {
    return <CollapseRail side="right" label="Inspector" onExpand={toggleInspector} />
  }

  const panel = TAB_PANELS[tab](pageId)

  return (
    <aside className={ASIDE}>
      <div className={GUTTER}>
        <CollapseButton side="right" label="Inspector" onCollapse={toggleInspector} />
      </div>
      <div className={CONTENT_COL}>
        <div role="tablist" aria-label="Editor sidebar tabs" className={TAB_LIST}>
          {TABS.map((t) => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setTab(t.id)
                }}
                className={cn(!isActive && 'shell-nav-item', tab_({ active: isActive }))}
              >
                {t.label}
                {isActive && <span aria-hidden="true" className={TAB_BAR} />}
              </button>
            )
          })}
        </div>
        {panel !== null && <Suspense fallback={<PanelFallback />}>{panel}</Suspense>}
      </div>
    </aside>
  )
}
