import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const metaTextVariants = cva('font-mono text-brand-neutral-600', {
  variants: {
    size: {
      sm: 'text-[10px]',
      default: 'text-[11px]',
    },
    truncate: {
      true: 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
      false: '',
    },
    align: {
      default: '',
      end: 'ml-auto',
    },
  },
  defaultVariants: {
    size: 'default',
    truncate: false,
    align: 'default',
  },
})

export type MetaTextProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof metaTextVariants>

export const MetaText = ({ className, size, truncate, align, ...props }: MetaTextProps) => (
  <span className={cn(metaTextVariants({ size, truncate, align, className }))} {...props} />
)

const eyebrowVariants = cva('text-[10px] font-extrabold tracking-[0.2em] text-brand-neutral-600')

export type EyebrowProps = HTMLAttributes<HTMLSpanElement>

export const Eyebrow = ({ className, ...props }: EyebrowProps) => (
  <span className={cn(eyebrowVariants(), className)} {...props} />
)
