import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { STRINGS } from '../../strings'

const SHORTCUTS: readonly { keys: string; does: string }[] = [
  { keys: '← → ↑ ↓', does: STRINGS.dash.shortcutSelect },
  { keys: '⌥ + arrow', does: STRINGS.dash.shortcutNudge },
  { keys: '⇧ ⌥ + arrow', does: STRINGS.dash.shortcutResize },
  { keys: '⇧ + click', does: STRINGS.dash.shortcutMultiSelect },
  { keys: '⌘ C · X · V', does: STRINGS.dash.shortcutClipboard },
  { keys: 'Esc', does: STRINGS.dash.shortcutDeselect },
]

export interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ShortcutsDialog = ({ open, onOpenChange }: ShortcutsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent aria-describedby={undefined} className="max-w-md">
      <DialogTitle>{STRINGS.dash.shortcuts}</DialogTitle>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys} className="contents">
            <dt className="font-num text-app-secondary">{shortcut.keys}</dt>
            <dd>{shortcut.does}</dd>
          </div>
        ))}
      </dl>
    </DialogContent>
  </Dialog>
)
