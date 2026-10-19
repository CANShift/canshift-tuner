import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { Obd2Pane } from '../signals/Obd2Pane'

export interface ObdSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ObdSheet = ({ open, onOpenChange }: ObdSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="gap-4 lg:max-h-[calc(100dvh-7rem)] lg:w-[560px]">
      <div className="flex flex-col">
        <SheetTitle className="text-xl font-bold">{STRINGS.car.obd}</SheetTitle>
        <SheetDescription className="text-[13px] text-app-muted">
          {STRINGS.car.obdHint}
        </SheetDescription>
      </div>
      <Obd2Pane />
    </SheetContent>
  </Sheet>
)
