import { Fragment } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const SHORTCUTS: readonly (readonly [string, string])[] = [
  ['Del / ⌫', 'Delete selected widgets'],
  ['↑ ↓ ← →', 'Nudge 1px (Shift: 10px)'],
  ['⌘A', 'Select all'],
  ['⌘C / ⌘X / ⌘V', 'Copy / cut / paste'],
  ['⌘Z / ⇧⌘Z', 'Undo / redo'],
  ['⌘S', 'Burn to device'],
  ['Alt-drag', 'Disable snap (1px)'],
  ['⌘-scroll', 'Zoom'],
  ['Esc', 'Deselect / close'],
  ['?', 'This help'],
]

export interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ShortcutsDialog = ({ open, onOpenChange }: ShortcutsDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keyboard shortcuts</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
          {SHORTCUTS.map(([keys, desc]) => (
            <Fragment key={keys}>
              <kbd className="font-mono text-ui-ink">{keys}</kbd>
              <span className="text-ui-muted">{desc}</span>
            </Fragment>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
