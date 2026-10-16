import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badge = cva('grid size-16 place-items-center rounded-full', {
  variants: {
    tone: {
      neutral: 'bg-app-surface-2 text-app-secondary',
      warning: 'bg-app-warning-bg text-app-warning',
      success: 'bg-app-success-bg text-app-success',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export interface CenteredStateProps extends VariantProps<typeof badge> {
  icon: ReactNode
  title: string
  children?: ReactNode
  actions?: ReactNode
}

export const CenteredState = ({ icon, tone, title, children, actions }: CenteredStateProps) => (
  <div className="flex flex-1 overflow-y-auto px-5 py-8">
    <div className="m-auto flex w-full max-w-[420px] flex-col gap-5">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className={cn(badge({ tone }))}>{icon}</span>
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
      </div>
      {children}
      {actions !== undefined && <div className="mt-4 flex flex-col gap-2">{actions}</div>}
    </div>
  </div>
)
