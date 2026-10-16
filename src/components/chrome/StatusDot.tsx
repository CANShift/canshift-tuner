import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dot = cva('inline-block size-2 shrink-0 rounded-full', {
  variants: {
    tone: {
      success: 'bg-app-success',
      warning: 'bg-app-warning',
      hollow: 'border-2 border-app-muted',
    },
  },
  defaultVariants: { tone: 'success' },
})

export type StatusDotProps = VariantProps<typeof dot> & { className?: string }

export const StatusDot = ({ tone, className }: StatusDotProps) => (
  <span aria-hidden="true" className={cn(dot({ tone }), className)} />
)
