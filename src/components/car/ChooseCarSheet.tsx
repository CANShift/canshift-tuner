import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { useProfileChange } from '../../hooks/useProfileChange'
import { CarList } from './CarList'
import { PendingCar } from './PendingCar'

export interface ChooseCarSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ChooseCarSheet = ({ open, onOpenChange }: ChooseCarSheetProps) => {
  const profile = useProfileChange()
  const waiting = profile.change.kind === 'pending' || profile.change.kind === 'error'
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[85dvh] lg:max-h-[calc(100dvh-7rem)]">
        <SheetTitle className="text-[21px] font-bold lg:text-lg">
          {STRINGS.car.chooseCar}
        </SheetTitle>
        <SheetDescription className="sr-only">{STRINGS.car.search}</SheetDescription>
        <PendingCar profile={profile} onDone={() => onOpenChange(false)} />
        {!waiting && <CarList onPick={profile.selectKey} />}
      </SheetContent>
    </Sheet>
  )
}
