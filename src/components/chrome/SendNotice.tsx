import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import type { Refusal } from '../../lib/sync/refusal'
import { useIsLaptop } from '../../hooks/useIsLaptop'
import { useShowMe } from '../../hooks/useShowMe'
import { dismissSendOutcome } from '../../stores/sync/send-actions'
import { useSyncStore } from '../../stores/sync/sync.store'
import { UiIcon } from '../icons/UiIcons'
import { RefusalCard } from './RefusalCard'

interface NoticeProps {
  refusals: Refusal[]
}

const SHOWN_REASONS = 3

const NoticeActions = ({ refusals }: NoticeProps) => {
  const showMe = useShowMe()
  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <Button
        className="h-[52px] bg-app-text text-base text-app-bg lg:h-11 lg:text-[15px]"
        onClick={() => {
          showMe(refusals[0]?.target ?? null)
        }}
      >
        {STRINGS.refused.showMe}
      </Button>
      <Button variant="outline" className="h-12 text-[15px] lg:h-11" onClick={dismissSendOutcome}>
        {STRINGS.refused.notNow}
      </Button>
    </div>
  )
}

const RefusedBanner = ({ refusals }: NoticeProps) => (
  <div
    role="alert"
    className="m-4 flex flex-wrap items-center gap-4 rounded-[12px] border border-[#5a3a12] bg-app-warning-bg px-5 py-4 lg:mx-8 lg:mt-6"
  >
    <UiIcon name="warning" className="size-6 text-app-warning" />
    <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-1">
      <span className="text-base font-bold">{STRINGS.refused.title}</span>
      {refusals.slice(0, SHOWN_REASONS).map((refusal) => (
        <span key={refusal.text} className="text-[15px] leading-snug text-[#ffd9a8]">
          {refusal.text}
        </span>
      ))}
      <span className="text-[15px] text-[#ffd9a8]">{STRINGS.refused.body}</span>
    </div>
    <NoticeActions refusals={refusals} />
  </div>
)

const RefusedSheet = ({ refusals }: NoticeProps) => (
  <Sheet open onOpenChange={dismissSendOutcome}>
    <SheetContent role="alertdialog" className="gap-4">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-app-warning-bg text-app-warning">
          <UiIcon name="warning" />
        </span>
        <div className="flex flex-col gap-1">
          <SheetTitle className="text-[21px] font-bold leading-tight">
            {STRINGS.refused.title}
          </SheetTitle>
          <SheetDescription className="text-[15px] leading-snug text-app-secondary">
            {STRINGS.refused.body}
          </SheetDescription>
        </div>
      </div>
      {refusals.slice(0, SHOWN_REASONS).map((refusal) => (
        <RefusalCard key={refusal.text} refusal={refusal} />
      ))}
      <NoticeActions refusals={refusals} />
    </SheetContent>
  </Sheet>
)

const DroppedBanner = () => (
  <div
    role="alert"
    className="m-4 flex flex-wrap items-center gap-4 rounded-[12px] border border-[#5a3a12] bg-app-warning-bg px-5 py-4 text-[15px] leading-snug text-app-warning-ink lg:mx-8 lg:mt-6"
  >
    <UiIcon name="wifiOff" className="size-6 text-app-warning" />
    <span className="min-w-0 flex-[1_1_300px]">{STRINGS.send.dropped}</span>
    <Button variant="outline" className="border-[#5a3a12]" onClick={dismissSendOutcome}>
      {STRINGS.refused.notNow}
    </Button>
  </div>
)

export const SendNotice = () => {
  const sendState = useSyncStore((s) => s.sendState)
  const refusals = useSyncStore((s) => s.refusals)
  const laptop = useIsLaptop()
  if (sendState === 'failed') return <DroppedBanner />
  if (sendState !== 'refused') return null
  return laptop ? <RefusedBanner refusals={refusals} /> : <RefusedSheet refusals={refusals} />
}
