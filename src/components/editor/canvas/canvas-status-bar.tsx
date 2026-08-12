import type { PageConfig, Widget } from '@canshift/core'

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

const STATUS_BAR = [
  'flex h-9 shrink-0 items-center gap-[22px] overflow-hidden px-5',
  'border-t-2 border-solid border-brand-divider',
  'whitespace-nowrap font-mono text-[11px] text-brand-neutral-600',
].join(' ')

const SelectionDetails = ({ widget, rect }: { widget: Widget; rect: GridRect }) => (
  <>
    <span>
      SELECTED{' '}
      <span className="text-brand-text">
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
  <div className={STATUS_BAR}>
    {selectedWidget && selectedRect ? (
      <SelectionDetails widget={selectedWidget} rect={selectedRect} />
    ) : (
      <span>
        {String(page.widgets.length)} widget{page.widgets.length === 1 ? '' : 's'} — click one to
        inspect
      </span>
    )}
    <span className="ml-auto">
      {page.showTopBar !== false ? 'top bar shown' : 'top bar hidden'}
    </span>
  </div>
)
