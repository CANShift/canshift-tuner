import type { PageConfig, TopBarConfig } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ActiveBar } from '@/components/ui/active-bar'
import { PageThumbnail } from '../../routes/PageThumbnail'

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

const cell = cva(
  [
    'relative flex w-[168px] shrink-0 cursor-pointer flex-col gap-1.5',
    'border-r border-solid border-brand-neutral-300 py-2.5 pl-3.5 pr-3',
  ].join(' '),
  {
    variants: {
      selected: { true: 'bg-brand-neutral-200', false: 'bg-transparent' },
      visible: { true: 'opacity-100', false: 'opacity-45' },
    },
    defaultVariants: { selected: false, visible: true },
  }
)

const HEADER = 'flex items-baseline gap-[7px]'

const INDEX = 'font-mono text-[11px] text-brand-neutral-600'

const NAME = [
  'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
  'text-[12px] font-extrabold text-brand-text',
].join(' ')

const COUNT = 'ml-auto font-mono text-[10px] text-brand-neutral-600'

const starButton = cva('cursor-pointer border-none bg-transparent p-0 text-[11px] leading-none', {
  variants: {
    isDefault: { true: 'text-brand-accent', false: 'text-brand-neutral-500' },
  },
  defaultVariants: { isDefault: false },
})

const REMOVE_BUTTON = [
  'cursor-pointer border-none bg-transparent p-0',
  'text-[13px] leading-none text-brand-neutral-500',
].join(' ')

const PREVIEW_FRAME =
  'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#0B0A0A]'

const HIDDEN_OVERLAY = [
  'absolute inset-0 flex items-center justify-center bg-black/55',
  'font-mono text-[10px] tracking-[0.14em] text-brand-neutral-600',
].join(' ')

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
      className={cn(cell({ selected: isSelected, visible: isVisible }))}
    >
      {isSelected && <ActiveBar />}
      <div className={HEADER}>
        <span className={INDEX}>{String(index + 1).padStart(2, '0')}</span>
        <span className={NAME}>Page {index + 1}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSetDefault(page.id)
          }}
          title={isDefault ? 'Default page (shown at boot)' : 'Set as default'}
          aria-label={isDefault ? 'Default page (shown at boot)' : 'Set as default'}
          aria-pressed={isDefault}
          className={cn(starButton({ isDefault }))}
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
            className={REMOVE_BUTTON}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
        <span className={COUNT}>{page.widgets.length}w</span>
      </div>
      <div className={PREVIEW_FRAME}>
        <PageThumbnail page={page} topBar={topBar} />
        {!isVisible && <div className={HIDDEN_OVERLAY}>hidden</div>}
      </div>
    </div>
  )
}
