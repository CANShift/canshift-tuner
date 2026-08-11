import type { ReactNode } from 'react'
import { MetaText } from '../ui/meta-text'

interface RouteHeaderProps {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}

export const RouteHeader = ({ title, subtitle, action }: RouteHeaderProps) => (
  <header className="flex h-12 shrink-0 items-center gap-3.5 border-b-2 border-brand-divider px-5">
    <div className="whitespace-nowrap text-sm font-extrabold tracking-[0.02em] text-brand-text">
      {title}
    </div>
    {subtitle != null && <MetaText truncate>{subtitle}</MetaText>}
    {action != null && <div className="ml-auto flex shrink-0 items-center gap-2.5">{action}</div>}
  </header>
)
