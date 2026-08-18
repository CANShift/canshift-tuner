import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface DashToolbarPage {
  id: string
  label: string
  isBoot: boolean
}

export interface DashToolbarPanel {
  id: string
  label: string
}

export interface DashToolbarProps {
  pages: DashToolbarPage[]
  selectedPageId: string
  onSelectPage: (id: string) => void
  onAddPage: () => void
  onSetBoot: () => void
  onDuplicatePage: () => void
  onMovePageEarlier: () => void
  onMovePageLater: () => void
  onUndo: () => void
  onDeletePage: () => void
  canAddPage: boolean
  isBootPage: boolean
  canMoveEarlier: boolean
  canMoveLater: boolean
  canUndo: boolean
  undoLabel: string | undefined
  canDeletePage: boolean
  panels: DashToolbarPanel[]
  selectedPanelId: string
  onSelectPanel: (id: string) => void
  pageMeta: string
  profileMeta: string
  previewModes: readonly { value: string; label: string; title: string }[]
  previewMode: string
  onPreviewMode: (mode: string) => void
  onAddWidget: () => void
  pageFull: boolean
  fullNote: string
  onImport: () => void
  onExport: () => void
  extras?: ReactNode
}

export const DashToolbar = ({
  pages,
  selectedPageId,
  onSelectPage,
  onAddPage,
  onSetBoot,
  onDuplicatePage,
  onMovePageEarlier,
  onMovePageLater,
  onUndo,
  onDeletePage,
  canAddPage,
  isBootPage,
  canMoveEarlier,
  canMoveLater,
  canUndo,
  undoLabel,
  canDeletePage,
  panels,
  selectedPanelId,
  onSelectPanel,
  pageMeta,
  profileMeta,
  previewModes,
  previewMode,
  onPreviewMode,
  onAddWidget,
  pageFull,
  fullNote,
  onImport,
  onExport,
  extras,
}: DashToolbarProps) => (
  <div className="flex h-[54px] shrink-0 items-center gap-3.5 border-b-2 border-ui-rule bg-ui-bg px-5">
    <span className="font-mono text-[11px] tracking-[0.18em] text-ui-muted">PAGE</span>

    <select
      value={selectedPageId}
      onChange={(e) => {
        onSelectPage(e.target.value)
      }}
      aria-label="Page"
      className="border-2 border-ui-rule bg-ui-bg py-2 pl-2.5 pr-[30px] font-mono text-[14px] font-bold text-ui-ink"
    >
      {pages.map((page) => (
        <option key={page.id} value={page.id}>
          {page.label}
          {page.isBoot ? ' · BOOT' : ''}
        </option>
      ))}
    </select>

    <div className="flex gap-px">
      <SquareButton label="Add a page" onClick={onAddPage} disabled={!canAddPage}>
        <path d="M8 3 V13 M3 8 H13" />
      </SquareButton>
      <SquareButton
        label={isBootPage ? 'This page boots the dash' : 'Boot the dash on this page'}
        onClick={onSetBoot}
        tone={isBootPage ? 'active' : 'default'}
      >
        <path d="M8 2 L10 6.4 L14.6 7 L11.2 10.2 L12.1 14.8 L8 12.6 L3.9 14.8 L4.8 10.2 L1.4 7 L6 6.4 Z" />
      </SquareButton>
      <SquareButton label="Duplicate this page" onClick={onDuplicatePage} disabled={!canAddPage}>
        <path d="M5.5 5.5 H13 V13 H5.5 Z M10.5 5.5 V3 H3 V10.5 H5.5" />
      </SquareButton>
      <SquareButton
        label="Move this page earlier"
        onClick={onMovePageEarlier}
        disabled={!canMoveEarlier}
      >
        <path d="M8 13 V4 M4 8 L8 4 L12 8" />
      </SquareButton>
      <SquareButton label="Move this page later" onClick={onMovePageLater} disabled={!canMoveLater}>
        <path d="M8 3 V12 M4 8 L8 12 L12 8" />
      </SquareButton>
      <SquareButton
        label={undoLabel !== undefined ? `Undo ${undoLabel}` : 'Undo'}
        onClick={onUndo}
        disabled={!canUndo}
      >
        <path d="M3 8 H10 A3 3 0 0 1 10 13 H7 M3 8 L6 5 M3 8 L6 11" />
      </SquareButton>
      <SquareButton
        label="Delete this page"
        onClick={onDeletePage}
        disabled={!canDeletePage}
        tone="danger"
      >
        <path d="M3 5 H13 M6.5 5 V3.5 H9.5 V5 M4.5 5 L5.2 13 H10.8 L11.5 5" />
      </SquareButton>
    </div>

    <select
      value={selectedPanelId}
      onChange={(e) => {
        onSelectPanel(e.target.value)
      }}
      aria-label="Panel model"
      className="border border-ui-ink bg-ui-bg py-2 pl-2.5 pr-[26px] font-mono text-[13px] text-ui-ink"
    >
      {panels.map((panel) => (
        <option key={panel.id} value={panel.id}>
          {panel.label}
        </option>
      ))}
    </select>

    <span className="hidden whitespace-nowrap font-mono text-[11.5px] text-ui-muted min-[1100px]:inline">
      {pageMeta}
    </span>

    <div className="flex-1" />

    <div className="hidden gap-px min-[1240px]:flex">
      {previewModes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => {
            onPreviewMode(mode.value)
          }}
          title={mode.title}
          className={cn(previewSegment({ active: mode.value === previewMode }))}
        >
          {mode.label}
        </button>
      ))}
    </div>

    <span className="hidden min-[1500px]:contents">{extras}</span>

    <span className="hidden whitespace-nowrap font-mono text-[11.5px] text-ui-muted min-[1320px]:inline">
      {profileMeta}
    </span>

    <GhostButton onClick={onAddWidget} disabled={pageFull} title={pageFull ? fullNote : undefined}>
      Add widget
    </GhostButton>
    <span className="hidden min-[1400px]:contents">
      <GhostButton onClick={onImport}>Import</GhostButton>
      <GhostButton onClick={onExport}>Export</GhostButton>
    </span>
  </div>
)

interface SquareButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'active' | 'danger'
  children: ReactNode
}

const SquareButton = ({
  label,
  onClick,
  disabled = false,
  tone = 'default',
  children,
}: SquareButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={cn(square({ tone, disabled }))}
  >
    <svg viewBox="0 0 16 16" className="w-[13px]" fill="none" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  </button>
)

const square = cva('grid size-[38px] place-items-center border bg-transparent', {
  variants: {
    tone: {
      default: 'border-ui-ink text-ui-ink',
      active: 'border-ui-accent text-ui-accent',
      danger: 'border-ui-accent text-ui-accent',
    },
    disabled: {
      true: 'cursor-not-allowed border-ui-line text-ui-faint',
      false: 'cursor-pointer hover:bg-ui-panel',
    },
  },
  defaultVariants: { tone: 'default', disabled: false },
})

const previewSegment = cva(
  'cursor-pointer whitespace-nowrap border border-ui-ink px-2.5 py-[7px] font-mono text-[10.5px] tracking-[0.08em]',
  {
    variants: {
      active: {
        true: 'bg-ui-rule text-ui-bg',
        false: 'bg-transparent text-ui-muted hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)

interface GhostButtonProps {
  onClick: () => void
  disabled?: boolean
  title?: string | undefined
  children: ReactNode
}

const GhostButton = ({ onClick, disabled = false, title, children }: GhostButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'whitespace-nowrap border px-4 py-[9px] text-left text-[12.5px] font-bold',
      disabled
        ? 'cursor-not-allowed border-ui-line bg-transparent text-ui-faint'
        : 'cursor-pointer border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel'
    )}
  >
    {children}
  </button>
)
