import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

export interface CruiseControlOverCapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageIds: string[]
  maxPages: number
}

export const CruiseControlOverCapDialog = ({
  open,
  onOpenChange,
  pageIds,
  maxPages,
}: CruiseControlOverCapDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cannot add cruise-control page</AlertDialogTitle>
          <AlertDialogDescription>
            You already have {pageIds.length.toString()} pages — the firmware accepts at most{' '}
            {maxPages.toString()}. Remove a page first, then enable cruise control.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ol className="mx-0 mb-0 mt-3 pl-6 text-[12px] text-text-dim">
          {pageIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ol>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
