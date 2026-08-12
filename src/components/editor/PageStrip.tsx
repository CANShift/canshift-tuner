import { memo } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { FIRMWARE_CAPS } from '@canshift/core'
import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { PageCell } from './page-cell'
import { Eyebrow } from '../ui/meta-text'

const STRIP = [
  'flex h-[100px] shrink-0 items-stretch',
  'border-b-2 border-solid border-brand-divider bg-brand-neutral-100',
].join(' ')

const HEADER_CELL = [
  'flex w-24 shrink-0 flex-col justify-between px-3.5 py-3',
  'border-r-2 border-solid border-brand-divider',
].join(' ')

const CELLS = 'flex flex-1 items-stretch overflow-x-auto'

const capCount = cva('font-mono text-[11px]', {
  variants: { atCap: { true: 'text-brand-accent', false: 'text-brand-neutral-600' } },
  defaultVariants: { atCap: false },
})

const addButton = cva(
  [
    'w-[92px] shrink-0 border-0 border-r border-solid border-brand-neutral-300',
    'bg-transparent text-[12px] font-extrabold tracking-[0.06em]',
  ].join(' '),
  {
    variants: {
      atCap: {
        true: 'cursor-not-allowed text-brand-neutral-500',
        false: 'cursor-pointer text-brand-neutral-700',
      },
    },
    defaultVariants: { atCap: false },
  }
)

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
    <div className={STRIP}>
      <div className={HEADER_CELL}>
        <Eyebrow>PAGES</Eyebrow>
        <span
          className={cn(capCount({ atCap }))}
          title={`Firmware accepts at most ${String(FIRMWARE_CAPS.MAX_PAGES)} pages`}
        >
          {selectedIndex + 1} / {pages.length} · max {FIRMWARE_CAPS.MAX_PAGES}
        </span>
      </div>
      <div className={CELLS}>
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
            className={cn('shell-nav-item', addButton({ atCap }))}
            disabled={atCap}
            onClick={onAdd}
            title={
              atCap
                ? `Firmware accepts at most ${String(FIRMWARE_CAPS.MAX_PAGES)} pages — remove one to add another`
                : 'Add a new page'
            }
          >
            + PAGE
          </button>
        )}
      </div>
    </div>
  )
}

export const PageStrip = memo(PageStripImpl)
