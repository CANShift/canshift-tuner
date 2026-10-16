import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'

const ToggleGroup = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={cn('flex gap-2', className)} {...props} />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ITEM = [
  'inline-flex h-11 items-center justify-center gap-2 rounded-control px-4 text-[15px]',
  'border border-app-border bg-app-surface text-app-text transition-colors',
  'data-[state=on]:border-app-text data-[state=on]:bg-app-text data-[state=on]:font-semibold data-[state=on]:text-app-bg',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ')

const ToggleGroupItem = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item ref={ref} className={cn(ITEM, className)} {...props} />
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
