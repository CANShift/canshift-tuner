import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MetaText } from '@/components/ui/meta-text'
import { AlignToolbar } from './AlignToolbar'

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2

const IS_MAC = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
const UNDO_KEYS = IS_MAC ? '⌘Z' : 'Ctrl+Z'
const REDO_KEYS = IS_MAC ? '⇧⌘Z' : 'Ctrl+Shift+Z'

const TOOLBAR = [
  'flex h-12 shrink-0 items-center gap-3.5 px-5',
  'border-b-2 border-solid border-brand-divider',
].join(' ')

const GROUP = 'flex border border-solid border-brand-neutral-400'

const GROUP_RULE = 'border-0 border-l border-solid border-brand-neutral-400'

const SQUARE_BUTTON = [
  'h-[26px] w-7 border-0 bg-transparent text-[13px] leading-none',
  'cursor-pointer text-brand-text',
  'disabled:cursor-default disabled:text-brand-neutral-400',
].join(' ')

const WORD_BUTTON = [
  'h-[26px] border-0 bg-transparent px-2.5 text-[10px] font-extrabold tracking-[0.08em]',
  'cursor-pointer text-brand-neutral-700',
  'disabled:cursor-default disabled:text-brand-neutral-400',
].join(' ')

const ZOOM_VALUE = [
  'w-12 cursor-pointer bg-transparent text-center font-mono text-[12px] text-brand-text',
  GROUP_RULE,
].join(' ')

const INFO = 'whitespace-nowrap'

const flag = cva('flex items-center gap-[7px] whitespace-nowrap font-mono text-[11px]', {
  variants: {
    alert: { true: 'text-brand-accent', false: 'text-brand-neutral-500' },
  },
  defaultVariants: { alert: false },
})

const flagDot = cva('h-[7px] w-[7px]', {
  variants: {
    alert: { true: 'bg-brand-accent', false: 'bg-brand-neutral-500' },
  },
  defaultVariants: { alert: false },
})

const REV_LIMIT = [
  'cursor-pointer border border-solid border-brand-accent bg-transparent px-3 py-1.5',
  'text-[11px] font-extrabold tracking-[0.08em] text-brand-accent',
  'disabled:cursor-default disabled:bg-[color-mix(in_srgb,hsl(var(--brand-accent))_14%,transparent)]',
].join(' ')

export interface CanvasToolbarProps {
  pageId: string
  selectedWidgetIds: string[]
  screenWidth: number
  screenHeight: number
  overflowingCount: number
  overflowingNames?: readonly string[]
  unboundCount: number
  canUndo: boolean
  undoLabel?: string | undefined
  redoLabel?: string | undefined
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onOpenShortcuts: () => void
  revLimiting: boolean
  onStartRevLimiter: () => void
}

export const CanvasToolbar = ({
  pageId,
  selectedWidgetIds,
  screenWidth,
  screenHeight,
  overflowingCount,
  overflowingNames,
  unboundCount,
  canUndo,
  undoLabel,
  redoLabel,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenShortcuts,
  revLimiting,
  onStartRevLimiter,
}: CanvasToolbarProps) => (
  <div className={TOOLBAR}>
    <div className={GROUP}>
      <button
        type="button"
        className={cn('shell-nav-item', WORD_BUTTON)}
        onClick={onUndo}
        disabled={!canUndo}
        title={undoLabel ? `Undo ${undoLabel} (${UNDO_KEYS})` : `Undo (${UNDO_KEYS})`}
      >
        UNDO
      </button>
      <button
        type="button"
        className={cn('shell-nav-item', WORD_BUTTON, GROUP_RULE)}
        onClick={onRedo}
        disabled={!canRedo}
        title={redoLabel ? `Redo ${redoLabel} (${REDO_KEYS})` : `Redo (${REDO_KEYS})`}
      >
        REDO
      </button>
    </div>

    <div className={GROUP}>
      <button
        type="button"
        className={cn('shell-nav-item', SQUARE_BUTTON)}
        onClick={onZoomOut}
        disabled={zoom <= ZOOM_MIN}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <span aria-hidden="true">−</span>
      </button>
      <button
        type="button"
        onClick={onZoomReset}
        title="Reset zoom"
        aria-label="Reset zoom"
        className={ZOOM_VALUE}
      >
        {Math.round(zoom * 100)} %
      </button>
      <button
        type="button"
        className={cn('shell-nav-item', SQUARE_BUTTON, GROUP_RULE)}
        onClick={onZoomIn}
        disabled={zoom >= ZOOM_MAX}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>

    <MetaText className={INFO}>
      {screenWidth} × {screenHeight} · 12-col grid · snap on
    </MetaText>

    <span
      className={cn(flag({ alert: overflowingCount > 0 }))}
      title={
        overflowingCount > 0 && overflowingNames !== undefined
          ? `Past the ${String(screenWidth)} × ${String(screenHeight)} grid: ${overflowingNames.join(', ')}`
          : `Layout fits ${String(screenWidth)} × ${String(screenHeight)}`
      }
    >
      <span aria-hidden="true" className={cn(flagDot({ alert: overflowingCount > 0 }))} />
      {overflowingCount > 0
        ? `${String(overflowingCount)} out of bounds`
        : `fits ${String(screenWidth)} × ${String(screenHeight)}`}
    </span>

    {unboundCount > 0 && (
      <span
        className={cn(flag({ alert: true }))}
        title="Widgets with no signal bound render -- on the device. Drag a signal from the Signals tab onto them."
      >
        <span aria-hidden="true" className={cn(flagDot({ alert: true }))} />
        {`${String(unboundCount)} unbound`}
      </span>
    )}

    {selectedWidgetIds.length >= 2 && (
      <>
        <AlignToolbar
          pageId={pageId}
          widgetIds={selectedWidgetIds}
          canDistribute={selectedWidgetIds.length >= 3}
        />
        <MetaText className={INFO}>{String(selectedWidgetIds.length)} selected</MetaText>
      </>
    )}

    <div className="flex-1" />

    <button
      type="button"
      className={cn('shell-nav-item', SQUARE_BUTTON)}
      onClick={onOpenShortcuts}
      title="Keyboard shortcuts (?)"
    >
      ?
    </button>

    <button
      type="button"
      className={cn('editor-ghost-accent', REV_LIMIT)}
      onClick={onStartRevLimiter}
      disabled={revLimiting}
      title="Simulate rev limiter (5s)"
    >
      REV LIMIT
    </button>
  </div>
)
