import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { STRINGS } from '../../strings'

const L = STRINGS.sessionLogs

export interface DeleteLogDialogProps {
  name: string | null
  onDelete: (name: string) => void
  onCancel: () => void
}

export const DeleteLogDialog = ({ name, onDelete, onCancel }: DeleteLogDialogProps) => (
  <AlertDialog open={name !== null} onOpenChange={(open) => !open && onCancel()}>
    <AlertDialogContent className="bottom-6 top-auto max-w-[calc(100vw-32px)] translate-y-0 gap-4 sm:max-w-md lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
      <AlertDialogTitle className="text-[21px] leading-tight">
        {L.removeTitle(name ?? '')}
      </AlertDialogTitle>
      <AlertDialogDescription className="text-[15px] leading-normal text-app-secondary">
        {L.removeBody}
      </AlertDialogDescription>
      <div className="flex flex-col gap-2">
        <AlertDialogAction
          className="h-[52px] text-base"
          onClick={() => {
            if (name !== null) onDelete(name)
          }}
        >
          {L.remove}
        </AlertDialogAction>
        <AlertDialogCancel className="mt-0 h-12 border-0 text-[15px]">{L.cancel}</AlertDialogCancel>
      </div>
    </AlertDialogContent>
  </AlertDialog>
)
