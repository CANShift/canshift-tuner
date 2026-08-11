import type { CSSProperties } from 'react'
import type { PageConfig, Widget } from '@canshift/core'
import { MONO_FONT } from '../../../lib/typography'

interface GridRect {
  x: number
  y: number
  w: number
  h: number
}

export interface CanvasStatusBarProps {
  page: PageConfig
  selectedWidget: Widget | undefined
  selectedRect: GridRect | null
}

const SelectionDetails = ({ widget, rect }: { widget: Widget; rect: GridRect }) => (
  <>
    <span>
      SELECTED{' '}
      <span style={statusValueStyle}>
        {widget.type}
        {widget.signal ? `.${widget.signal}` : ''}
      </span>
    </span>
    <span>
      col {widget.layout.col} · span {widget.layout.colSpan}
    </span>
    <span>
      row {widget.layout.row} · span {widget.layout.rowSpan}
    </span>
    <span>
      x {rect.x} · y {rect.y} · w {rect.w} · h {rect.h}
    </span>
  </>
)

export const CanvasStatusBar = ({ page, selectedWidget, selectedRect }: CanvasStatusBarProps) => (
  <div style={statusBarStyle}>
    {selectedWidget && selectedRect ? (
      <SelectionDetails widget={selectedWidget} rect={selectedRect} />
    ) : (
      <span>
        {String(page.widgets.length)} widget{page.widgets.length === 1 ? '' : 's'} — click one to
        inspect
      </span>
    )}
    <span style={{ marginLeft: 'auto' }}>
      {page.showTopBar !== false ? 'top bar shown' : 'top bar hidden'}
    </span>
  </div>
)

const statusBarStyle: CSSProperties = {
  height: 36,
  flexShrink: 0,
  borderTop: '2px solid var(--brand-divider)',
  display: 'flex',
  alignItems: 'center',
  gap: 22,
  padding: '0 20px',
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}

const statusValueStyle: CSSProperties = {
  color: 'hsl(var(--brand-text))',
}
