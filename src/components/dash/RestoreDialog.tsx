import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import type { BackupSummary } from '../../lib/backup/backup'
import { UiIcon } from '../icons/UiIcons'

const D = STRINGS.dash

export interface RestoreDialogProps {
  summary: BackupSummary | null
  onReplace: () => void
  onSaveFirst: () => void
  onCancel: () => void
}

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const FileCard = ({ summary }: { summary: BackupSummary }) => (
  <div className="flex items-start gap-3 rounded-control border border-app-border bg-app-bg p-3">
    <UiIcon name="file" className="mt-0.5 text-app-muted" />
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[15px] font-semibold wrap-anywhere">{summary.fileName}</span>
      <span className="text-[13px] text-app-muted">
        {D.restoreSummary(
          summary.savedAt === null ? '—' : DATE_FORMAT.format(summary.savedAt),
          summary.car,
          summary.pages
        )}
      </span>
    </div>
  </div>
)

export const RestoreDialog = ({
  summary,
  onReplace,
  onSaveFirst,
  onCancel,
}: RestoreDialogProps) => (
  <AlertDialog open={summary !== null} onOpenChange={(open) => !open && onCancel()}>
    <AlertDialogContent className="bottom-6 top-auto max-w-[calc(100vw-32px)] translate-y-0 gap-4 sm:max-w-md lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
      <AlertDialogTitle className="text-[21px] leading-tight">{D.restoreTitle}</AlertDialogTitle>
      {summary !== null && <FileCard summary={summary} />}
      <AlertDialogDescription className="text-[15px] leading-normal text-app-secondary">
        {D.restoreBody}
      </AlertDialogDescription>
      <div className="flex flex-col gap-2">
        <AlertDialogAction className="h-[52px] text-base" onClick={onReplace}>
          {D.restoreReplace}
        </AlertDialogAction>
        <Button variant="secondary" className="h-12 text-[15px]" onClick={onSaveFirst}>
          {D.restoreSaveFirst}
        </Button>
        <AlertDialogCancel className="mt-0 h-12 border-0 text-[15px]">{D.cancel}</AlertDialogCancel>
      </div>
    </AlertDialogContent>
  </AlertDialog>
)
