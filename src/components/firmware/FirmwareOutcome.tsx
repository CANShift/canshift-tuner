import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import type { FirmwareFailure } from '../../lib/firmware/failure'
import { useFirmwareStore } from '../../stores/firmware.store'
import { CenteredState } from '../chrome/CenteredState'
import { UiIcon } from '../icons/UiIcons'

const F = STRINGS.firmware

const DONE_STEPS = [F.doneUpload, F.doneSignature, F.doneInstall, F.doneRestart]

const PRIMARY = 'h-[52px] bg-app-text text-base text-app-bg'

const useLeave = (): (() => void) => {
  const navigate = useNavigate()
  const finish = useFirmwareStore((s) => s.finish)
  return () => {
    finish()
    void navigate('/dash')
  }
}

const DoneSteps = () => (
  <ol className="flex flex-col gap-3 text-[15px] text-app-secondary">
    {DONE_STEPS.map((step) => (
      <li key={step} className="flex items-center gap-2.5">
        <UiIcon name="check" className="text-app-success" />
        {step}
      </li>
    ))}
  </ol>
)

export const FirmwareSuccess = ({ reconnected }: { reconnected: boolean }) => {
  const version = useFirmwareStore((s) => s.bin?.info.version ?? '')
  const leave = useLeave()
  return (
    <CenteredState
      tone="success"
      icon={<UiIcon name="check" className="size-9" />}
      title={F.successTitle(version)}
      actions={
        <Button className={PRIMARY} onClick={leave}>
          {F.done}
        </Button>
      }
    >
      <p className="text-center text-base leading-normal text-app-secondary">
        {reconnected ? F.successBody : `${F.reconnectBody} ${F.reconnectByHand}.`}
      </p>
      <DoneSteps />
    </CenteredState>
  )
}

const FailedActions = () => {
  const back = useFirmwareStore((s) => s.backToChoosing)
  const leave = useLeave()
  return (
    <>
      <Button className={PRIMARY} onClick={back}>
        {F.chooseAgain}
      </Button>
      <Button variant="outline" className="h-12 text-[15px]" onClick={leave}>
        {F.backToDash}
      </Button>
    </>
  )
}

export const FirmwareFailed = ({ failure }: { failure: FirmwareFailure }) => (
  <CenteredState
    tone="warning"
    icon={<UiIcon name="warning" className="size-9" />}
    title={F.failureTitle}
    actions={<FailedActions />}
  >
    <p className="text-center text-base leading-normal text-app-secondary">{failure.cause}</p>
    <div className="flex flex-col gap-1.5 rounded-[12px] border border-app-border bg-app-surface px-4 py-3.5">
      <span className="text-[13px] text-app-muted">{F.whatToDo}</span>
      <span className="text-[15px] leading-normal">{failure.advice}</span>
    </div>
  </CenteredState>
)
