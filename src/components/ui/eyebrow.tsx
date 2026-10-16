import type { HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const eyebrowVariants = cva('text-[10px] font-extrabold tracking-[0.2em] text-app-muted')

export type EyebrowProps = HTMLAttributes<HTMLSpanElement>

export const Eyebrow = ({ className, ...props }: EyebrowProps) => (
  <span className={cn(eyebrowVariants(), className)} {...props} />
)
