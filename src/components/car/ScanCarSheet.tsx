import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { useProfileChange } from '../../hooks/useProfileChange'
import { useCanSpeedDraft } from '../../hooks/useSettingsDraft'
import { parseCanSpeed } from '../../lib/can-speed'
import { useCarScanStore } from '../../stores/car-scan/car-scan.store'
import { PendingCar } from './PendingCar'
import { ScanCarBody } from './ScanCarBody'

export interface ScanCarSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const useStageDetectedSpeed = (): (() => void) => {
  const result = useCarScanStore((s) => s.result)
  const speed = useCanSpeedDraft()
  return () => {
    const detected = result?.outcome === 'detected' ? parseCanSpeed(String(result.kbps)) : null
    if (detected !== null) speed.set(detected)
  }
}

export const ScanCarSheet = ({ open, onOpenChange }: ScanCarSheetProps) => {
  const profile = useProfileChange()
  const stageSpeed = useStageDetectedSpeed()
  const reviewing = profile.change.kind === 'pending' || profile.change.kind === 'error'
  const confirm = () => {
    stageSpeed()
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-4 lg:max-h-[calc(100dvh-7rem)] lg:w-[480px]">
        <div className="flex flex-col">
          <SheetTitle className="text-xl font-bold">{STRINGS.carScan.title}</SheetTitle>
          <SheetDescription className="text-[13px] text-app-muted">
            {STRINGS.carScan.hint}
          </SheetDescription>
        </div>
        <PendingCar profile={profile} onDone={confirm} />
        {!reviewing && <ScanCarBody onReview={profile.selectKey} />}
      </SheetContent>
    </Sheet>
  )
}
