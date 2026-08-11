import { lazy, Suspense, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { CollapseRail, CollapseButton } from '../components/shell/CollapseRail'
import { useUiStore } from '../stores/ui.store'

const PropertyPanel = lazy(() => import('../components/editor/PropertyPanel'))
const SignalsPanel = lazy(() => import('../components/editor/SignalsPanel'))
const WidgetPalette = lazy(() => import('../components/editor/WidgetPalette'))
const WidgetListPanel = lazy(() => import('../components/editor/WidgetListPanel'))
const HistoryPanel = lazy(() => import('../components/editor/HistoryPanel'))

type Tab = 'properties' | 'widgets' | 'signals' | 'library' | 'history'

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

const PanelFallback = () => <div style={fallbackStyle}>Loading…</div>

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
    <aside style={asideStyle}>
      <div style={gutterStyle}>
        <CollapseButton side="right" label="Inspector" onCollapse={toggleInspector} />
      </div>
      <div style={contentColStyle}>
        <div role="tablist" aria-label="Editor sidebar tabs" style={tabListStyle}>
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
                className={isActive ? undefined : 'shell-nav-item'}
                style={tabStyle(isActive)}
              >
                {t.label}
                {isActive && <span aria-hidden="true" style={tabBarStyle} />}
              </button>
            )
          })}
        </div>
        {panel !== null && <Suspense fallback={<PanelFallback />}>{panel}</Suspense>}
      </div>
    </aside>
  )
}

const asideStyle: CSSProperties = {
  width: 320,
  flexShrink: 0,
  borderLeft: '2px solid var(--brand-divider)',
  display: 'flex',
  flexDirection: 'row',
  minHeight: 0,
  overflow: 'hidden',
}

const gutterStyle: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 8,
  borderRight: '1px solid var(--brand-divider)',
  background: 'hsl(var(--brand-neutral-100))',
}

const contentColStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
}

const tabListStyle: CSSProperties = {
  display: 'flex',
  borderBottom: '2px solid var(--brand-divider)',
  flexShrink: 0,
}

const tabStyle = (active: boolean): CSSProperties => ({
  position: 'relative',
  flex: 1,
  padding: '11px 0',
  background: 'none',
  border: 0,
  fontWeight: 800,
  fontSize: 9,
  letterSpacing: '0.06em',
  color: active ? 'hsl(var(--brand-text))' : 'hsl(var(--brand-neutral-600))',
  cursor: 'pointer',
})

const tabBarStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 3,
  background: 'hsl(var(--brand-accent))',
}

const fallbackStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'hsl(var(--brand-neutral-500))',
  fontSize: 11,
}
