import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

export interface DtcClearConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  codeCount: number
  onConfirm: () => void
}

export const DtcClearConfirmDialog = ({
  open,
  onOpenChange,
  codeCount,
  onConfirm,
}: DtcClearConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear trouble codes?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears all {codeCount} stored code{codeCount === 1 ? '' : 's'} on the ECU (OBD-II
            Mode 04) and turns off the check-engine light. Any code for an unresolved fault will
            return on the next drive cycle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Clear codes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
