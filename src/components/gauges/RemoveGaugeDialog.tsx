import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { STRINGS } from '../../strings'

export interface RemoveGaugeDialogProps {
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: () => void
}

export const RemoveGaugeDialog = ({
  name,
  open,
  onOpenChange,
  onRemove,
}: RemoveGaugeDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent
      aria-describedby={undefined}
      className="max-w-[calc(100vw-32px)] sm:max-w-md"
    >
      <AlertDialogTitle className="text-lg leading-snug">
        {STRINGS.gauges.removeConfirm(name)}
      </AlertDialogTitle>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel>{STRINGS.gauges.cancel}</AlertDialogCancel>
        <AlertDialogAction onClick={onRemove}>{STRINGS.gauges.remove}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
