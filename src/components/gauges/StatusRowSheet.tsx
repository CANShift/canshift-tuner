import type { PageConfig } from '@canshift/core'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { STATUS_SLOTS } from '../../lib/status-row'
import { StatusSlotEditor } from './StatusSlotEditor'

const S = STRINGS.statusRow

export interface StatusRowSheetProps {
  page: PageConfig
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const StatusRowSheet = ({ page, open, onOpenChange }: StatusRowSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent>
      <SheetTitle className="text-[21px] font-bold lg:text-lg">{S.title}</SheetTitle>
      <SheetDescription className="text-sm text-app-muted">{S.description}</SheetDescription>
      {STATUS_SLOTS.map((slot) => (
        <StatusSlotEditor key={slot} page={page} slot={slot} />
      ))}
    </SheetContent>
  </Sheet>
)
