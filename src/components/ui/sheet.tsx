import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTitle = DialogPrimitive.Title
const SheetDescription = DialogPrimitive.Description
const SheetClose = DialogPrimitive.Close

const SHEET = [
  'fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col gap-3.5 overflow-y-auto',
  'isolate rounded-t-sheet border-t border-app-border bg-app-surface px-4 pt-2 text-app-text shadow-overlay',
  'pb-[max(env(safe-area-inset-bottom),28px)] focus:outline-none',
  'lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-20 lg:w-[400px] lg:rounded-card lg:border lg:p-5',
].join(' ')

const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/65 lg:bg-black/30" />
    <DialogPrimitive.Content ref={ref} className={cn(SHEET, className)} {...props}>
      <div aria-hidden="true" className="h-1 w-9 self-center rounded-full bg-[#3a3f46] lg:hidden" />
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle }
