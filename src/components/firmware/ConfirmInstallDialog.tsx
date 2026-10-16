import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { STRINGS } from '../../strings'
import { useFirmwareStore } from '../../stores/firmware.store'

const F = STRINGS.firmware

export const ConfirmInstallDialog = () => {
  const open = useFirmwareStore((s) => s.view.kind === 'confirming')
  const version = useFirmwareStore((s) => s.bin?.info.version ?? '')
  const install = useFirmwareStore((s) => s.install)
  const back = useFirmwareStore((s) => s.backToChoosing)
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && back()}>
      <AlertDialogContent className="bottom-6 top-auto max-w-[calc(100vw-32px)] translate-y-0 gap-3.5 sm:max-w-md lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2">
        <AlertDialogTitle className="text-[22px]">{F.confirmTitle(version)}</AlertDialogTitle>
        <AlertDialogDescription className="text-[15px] leading-normal text-app-secondary">
          {F.confirmBody}
        </AlertDialogDescription>
        <ul className="flex list-disc flex-col gap-1 rounded-control bg-app-warning-bg py-3 pl-8 pr-3.5 text-sm text-app-warning-ink">
          <li>{F.keepPower}</li>
          <li>{F.stayNear}</li>
        </ul>
        <div className="mt-1 flex flex-col gap-2">
          <AlertDialogAction className="h-[52px] text-base" onClick={() => void install()}>
            {F.confirmInstall}
          </AlertDialogAction>
          <AlertDialogCancel className="mt-0 h-12 text-[15px]">{F.cancel}</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
