import type { CSSProperties } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { PageThumbnail } from '../../routes/PageThumbnail'
import { MONO_FONT } from '../../lib/typography'

export interface PageCellProps {
  page: PageConfig
  index: number
  topBar: TopBarConfig
  isSelected: boolean
  isDefault: boolean
  canRemove: boolean
  onSelect: (pageId: string) => void
  onDragStart: (index: number) => void
  onDrop: (toIndex: number) => void
  onSetDefault: (pageId: string) => void
  onRemove: (pageId: string) => void
  onContextMenu: (pageId: string, x: number, y: number) => void
}

export const PageCell = ({
  page,
  index,
  topBar,
  isSelected,
  isDefault,
  canRemove,
  onSelect,
  onDragStart,
  onDrop,
  onSetDefault,
  onRemove,
  onContextMenu,
}: PageCellProps) => {
  const isVisible = page.visible !== false
  return (
    <div
      draggable
      onDragStart={() => {
        onDragStart(index)
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={() => {
        onDrop(index)
      }}
      onClick={() => {
        onSelect(page.id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextMenu(page.id, e.clientX, e.clientY)
      }}
      style={cellStyle(isSelected, isVisible)}
    >
      {isSelected && <span aria-hidden="true" style={selectedBarStyle} />}
      <div style={cellHeaderStyle}>
        <span style={cellIndexStyle}>{String(index + 1).padStart(2, '0')}</span>
        <span style={cellNameStyle}>Page {index + 1}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSetDefault(page.id)
          }}
          title={isDefault ? 'Default page (shown at boot)' : 'Set as default'}
          aria-label={isDefault ? 'Default page (shown at boot)' : 'Set as default'}
          aria-pressed={isDefault}
          style={starButtonStyle(isDefault)}
        >
          <span aria-hidden="true">{isDefault ? '★' : '☆'}</span>
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(page.id)
            }}
            title="Remove page"
            aria-label={`Remove page ${String(index + 1)}`}
            style={removeButtonStyle}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
        <span style={cellCountStyle}>{page.widgets.length}w</span>
      </div>
      <div style={previewFrameStyle}>
        <PageThumbnail page={page} topBar={topBar} />
        {!isVisible && <div style={hiddenOverlayStyle}>hidden</div>}
      </div>
    </div>
  )
}

const cellStyle = (selected: boolean, visible: boolean): CSSProperties => ({
  position: 'relative',
  width: 168,
  flexShrink: 0,
  borderRight: '1px solid hsl(var(--brand-neutral-300))',
  padding: '10px 12px 10px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  cursor: 'pointer',
  background: selected ? 'hsl(var(--brand-neutral-200))' : 'transparent',
  opacity: visible ? 1 : 0.45,
})

const selectedBarStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 3,
  background: 'hsl(var(--brand-accent))',
}

const cellHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 7,
}

const cellIndexStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
}

const cellNameStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: 12,
  color: 'hsl(var(--brand-text))',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
}

const cellCountStyle: CSSProperties = {
  marginLeft: 'auto',
  fontFamily: MONO_FONT,
  fontSize: 10,
  color: 'hsl(var(--brand-neutral-600))',
}

const starButtonStyle = (isDefault: boolean): CSSProperties => ({
  background: 'transparent',
  border: 'none',
  padding: 0,
  fontSize: 11,
  lineHeight: 1,
  cursor: 'pointer',
  color: isDefault ? 'hsl(var(--brand-accent))' : 'hsl(var(--brand-neutral-500))',
})

const removeButtonStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  fontSize: 13,
  lineHeight: 1,
  cursor: 'pointer',
  color: 'hsl(var(--brand-neutral-500))',
}

const previewFrameStyle: CSSProperties = {
  position: 'relative',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  background: '#0B0A0A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const hiddenOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.55)',
  fontFamily: MONO_FONT,
  fontSize: 10,
  letterSpacing: '0.14em',
  color: 'hsl(var(--brand-neutral-600))',
}
