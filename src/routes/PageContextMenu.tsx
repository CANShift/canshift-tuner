import { useEffect, useRef, type RefObject } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const MENU = [
  'fixed z-[9999] min-w-[180px] max-h-[70vh] overflow-y-auto py-[3px]',
  'border border-solid border-ui-line-strong bg-ui-bg',
].join(' ')

const menuItem = cva(
  'block w-full border-none bg-transparent px-3 py-[5px] text-left text-[12px]',
  {
    variants: {
      tone: {
        disabled: 'cursor-default text-ui-faint',
        danger: 'cursor-pointer text-ui-accent hover:bg-ui-panel',
        normal: 'cursor-pointer text-ui-ink hover:bg-ui-panel',
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
  templates: readonly { id: string; name: string }[]
  onInsertTemplate: (templateId: string) => void
  onManageTemplates: () => void
}

interface MenuItem {
  label: string
  action: () => void
  danger?: boolean
  disabled?: boolean
}

type MenuRef = RefObject<HTMLDivElement | null>

const useCloseOnOutsideClick = (ref: MenuRef, onClose: () => void) => {
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('mousedown', close)
    }
  }, [ref, onClose])
}

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }

const enabledButtons = (ref: MenuRef): HTMLButtonElement[] =>
  Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])

const moveFocus = (ref: MenuRef, step: number) => {
  const list = enabledButtons(ref)
  const idx = list.indexOf(document.activeElement as HTMLButtonElement)
  list[(idx + step + list.length) % list.length]?.focus()
}

const useMenuKeyboard = (ref: MenuRef, onClose: () => void) => {
  useEffect(() => {
    enabledButtons(ref)[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      const step = ARROW_STEPS[e.key]
      if (step === undefined) return
      e.preventDefault()
      moveFocus(ref, step)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, onClose])
}

export const menuItems = (props: PageContextMenuProps): MenuItem[] => [
  { label: 'Duplicate', action: props.onDuplicate },
  { label: 'Save as template', action: props.onSaveAsTemplate },
  {
    label: props.isDefault ? 'Default ★' : 'Set as default',
    action: props.onSetDefault,
    disabled: props.isDefault,
  },
  { label: props.isVisible ? 'Hide page' : 'Show page', action: props.onToggleVisible },
  { label: 'Delete', action: props.onDelete, danger: true, disabled: !props.canDelete },
  ...props.templates.map((template) => ({
    label: `Insert “${template.name}”`,
    action: () => {
      props.onInsertTemplate(template.id)
    },
  })),
  {
    label: 'Manage templates…',
    action: props.onManageTemplates,
    disabled: props.templates.length === 0,
  },
]

const MenuButton = ({ item, onClose }: { item: MenuItem; onClose: () => void }) => (
  <button
    disabled={item.disabled}
    onClick={() => {
      if (item.disabled) return
      item.action()
      onClose()
    }}
    className={cn(menuItem({ tone: toneOf(item) }))}
  >
    {item.label}
  </button>
)

export const PageContextMenu = (props: PageContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null)
  useCloseOnOutsideClick(ref, props.onClose)
  useMenuKeyboard(ref, props.onClose)
  return (
    <div
      ref={ref}
      className={MENU}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ top: props.y, left: props.x }}
    >
      {menuItems(props).map((item) => (
        <MenuButton key={item.label} item={item} onClose={props.onClose} />
      ))}
    </div>
  )
}
