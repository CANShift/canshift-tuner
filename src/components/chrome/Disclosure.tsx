import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { UiIcon } from '../icons/UiIcons'

export interface DisclosureProps {
  title: string
  hint?: string
  defaultOpen?: boolean
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export const Disclosure = ({
  title,
  hint,
  defaultOpen,
  className,
  bodyClassName,
  children,
}: DisclosureProps) => {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <section className={cn('rounded-card border border-app-border bg-app-surface', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-[52px] w-full items-center gap-3 px-3.5 text-left lg:px-5"
      >
        <span className="flex flex-1 flex-col py-2">
          <span className="text-[15px]">{title}</span>
          {hint !== undefined && <span className="text-xs text-app-muted lg:text-sm">{hint}</span>}
        </span>
        <UiIcon name={open ? 'chevronDown' : 'chevronRight'} className="text-app-muted" />
      </button>
      {open && <div className={cn('border-t border-app-divider', bodyClassName)}>{children}</div>}
    </section>
  )
}
