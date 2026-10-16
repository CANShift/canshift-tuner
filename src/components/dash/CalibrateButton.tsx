import { useState } from 'react'
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
import { usbService } from '../../transport'
import { useConnection } from '../../hooks/useConnection'
import { useToastStore } from '../../stores/toast.store'

const D = STRINGS.dash

const calibrate = async (): Promise<void> => {
  const result = await usbService.calibrateTouch()
  if (!result.success) useToastStore.getState().show(D.calibrateFailed, 'warning')
}

export const CalibrateButton = () => {
  const [asking, setAsking] = useState(false)
  const connected = useConnection().connection === 'connected'
  return (
    <>
      <Button variant="secondary" disabled={!connected} onClick={() => setAsking(true)}>
        {D.calibrate}
      </Button>
      <AlertDialog open={asking} onOpenChange={setAsking}>
        <AlertDialogContent className="max-w-[calc(100vw-32px)] sm:max-w-md">
          <AlertDialogTitle>{D.calibrateTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] text-app-secondary">
            {D.calibrateBody}
          </AlertDialogDescription>
          <div className="flex flex-col gap-2">
            <AlertDialogAction className="h-12" onClick={() => void calibrate()}>
              {D.calibrateStart}
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 h-12">{D.cancel}</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
