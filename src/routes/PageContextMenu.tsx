import { useEffect, useRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const MENU = [
  'fixed z-[9999] min-w-[140px] py-[3px]',
  'border border-solid border-brand-neutral-300 bg-brand-chrome-surface',
  'shadow-[0_4px_16px_#00000066]',
].join(' ')

const menuItem = cva(
  'block w-full border-none bg-transparent px-3 py-[5px] text-left text-[12px]',
  {
    variants: {
      tone: {
        disabled: 'cursor-default text-brand-neutral-400',
        danger:
          'cursor-pointer text-status-danger hover:bg-[color-mix(in_srgb,hsl(var(--brand-accent))_14%,transparent)]',
        normal: 'cursor-pointer text-brand-neutral-700 hover:bg-brand-neutral-200',
      },
    },
    defaultVariants: { tone: 'normal' },
  }
)

const toneOf = (item: {
  disabled?: boolean
  danger?: boolean
}): 'disabled' | 'danger' | 'normal' => {
  if (item.disabled === true) return 'disabled'
  if (item.danger === true) return 'danger'
  return 'normal'
}

export interface PageContextMenuProps {
  pageId: string
  x: number
  y: number
  isDefault: boolean
  isVisible: boolean
  canDelete: boolean
  onClose: () => void
  onDuplicate: () => void
  onSaveAsTemplate: () => void
  onSetDefault: () => void
  onToggleVisible: () => void
  onDelete: () => void
}

export const PageContextMenu = ({
  x,
  y,
  isDefault,
  isVisible,
  canDelete,
  onClose,
  onDuplicate,
  onSaveAsTemplate,
  onSetDefault,
  onToggleVisible,
  onDelete,
}: PageContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('mousedown', close)
    }
  }, [onClose])

  useEffect(() => {
    const btns = () =>
      Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
    btns()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const list = btns()
      const idx = list.indexOf(document.activeElement as HTMLButtonElement)
      const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1
      list[(next + list.length) % list.length]?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const items: {
    label: string
    action: () => void
    danger?: boolean
    disabled?: boolean
  }[] = [
    { label: 'Duplicate', action: onDuplicate },
    { label: 'Save as template', action: onSaveAsTemplate },
    {
      label: isDefault ? 'Default ★' : 'Set as default',
      action: onSetDefault,
      disabled: isDefault,
    },
    { label: isVisible ? 'Hide page' : 'Show page', action: onToggleVisible },
    { label: 'Delete', action: onDelete, danger: true, disabled: !canDelete },
  ]

  return (
    <div
      ref={ref}
      className={MENU}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ top: y, left: x }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              item.action()
              onClose()
            }
          }}
          className={cn(menuItem({ tone: toneOf(item) }))}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
