import { memo } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { FIRMWARE_CAPS } from '@canshift/core'
import type { CSSProperties, ReactNode } from 'react'
import { PageCell } from './page-cell'
import { MONO_FONT } from '../../lib/typography'

const STRIP_HEIGHT = 100

export interface PageStripProps {
  pages: readonly PageConfig[]
  topBar: TopBarConfig
  selectedPageId: string | null
  defaultPageId: string | undefined
  atCap: boolean
  newPageControl?: ReactNode
  onSelect: (pageId: string) => void
  onAdd: () => void
  onDragStart: (index: number) => void
  onDrop: (toIndex: number) => void
  onSetDefault: (pageId: string) => void
  onRemove: (pageId: string) => void
  onContextMenu: (pageId: string, x: number, y: number) => void
}

const PageStripImpl = ({
  pages,
  topBar,
  selectedPageId,
  defaultPageId,
  atCap,
  newPageControl,
  onSelect,
  onAdd,
  onDragStart,
  onDrop,
  onSetDefault,
  onRemove,
  onContextMenu,
}: PageStripProps) => {
  const selectedIndex = pages.findIndex((p) => p.id === (selectedPageId ?? pages[0]?.id))
  return (
    <div style={stripStyle}>
      <div style={headerCellStyle}>
        <span style={headerLabelStyle}>PAGES</span>
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            color: atCap ? 'hsl(var(--brand-accent))' : 'hsl(var(--brand-neutral-600))',
          }}
          title={`Firmware accepts at most ${String(FIRMWARE_CAPS.MAX_PAGES)} pages`}
        >
          {selectedIndex + 1} / {pages.length} · max {FIRMWARE_CAPS.MAX_PAGES}
        </span>
      </div>
      <div style={cellsStyle}>
        {pages.map((page, index) => (
          <PageCell
            key={page.id}
            page={page}
            index={index}
            topBar={topBar}
            isSelected={page.id === (selectedPageId ?? pages[0]?.id)}
            isDefault={page.id === defaultPageId}
            canRemove={pages.length > 1}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onSetDefault={onSetDefault}
            onRemove={onRemove}
            onContextMenu={onContextMenu}
          />
        ))}
        {newPageControl ?? (
          <button
            type="button"
            className="shell-nav-item"
            disabled={atCap}
            onClick={onAdd}
            title={
              atCap
                ? `Firmware accepts at most ${String(FIRMWARE_CAPS.MAX_PAGES)} pages — remove one to add another`
                : 'Add a new page'
            }
            style={addButtonStyle(atCap)}
          >
            + PAGE
          </button>
        )}
      </div>
    </div>
  )
}

const stripStyle: CSSProperties = {
  height: STRIP_HEIGHT,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'stretch',
  borderBottom: '2px solid var(--brand-divider)',
  background: 'hsl(var(--brand-neutral-100))',
}

const headerCellStyle: CSSProperties = {
  width: 96,
  flexShrink: 0,
  borderRight: '2px solid var(--brand-divider)',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

const headerLabelStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'hsl(var(--brand-neutral-600))',
}

const cellsStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'stretch',
  overflowX: 'auto',
}

const addButtonStyle = (atCap: boolean): CSSProperties => ({
  width: 92,
  flexShrink: 0,
  background: 'none',
  border: 0,
  borderRight: '1px solid hsl(var(--brand-neutral-300))',
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: '0.06em',
  color: atCap ? 'hsl(var(--brand-neutral-500))' : 'hsl(var(--brand-neutral-700))',
  cursor: atCap ? 'not-allowed' : 'pointer',
})

export const PageStrip = memo(PageStripImpl)
