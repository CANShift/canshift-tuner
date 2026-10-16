import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useChanges } from '../../hooks/useChanges'
import { UiIcon } from '../icons/UiIcons'
import { CenteredState } from './CenteredState'

const N = STRINGS.notConnected

const STEPS = [N.stepWorkshop, N.stepJoinUnknown, N.stepReturn]

export interface NotConnectedScreenProps {
  anotherDevice: boolean
  onTryAgain: () => void
  onKeepEditing: () => void
}

const Steps = () => (
  <ol className="flex flex-col gap-3.5 text-base leading-snug">
    {STEPS.map((step, index) => (
      <li key={step} className="flex gap-3">
        <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-app-surface-2 text-sm font-bold">
          {index + 1}
        </span>
        <span>{step}</span>
      </li>
    ))}
  </ol>
)

const Reassurance = () => {
  const count = useChanges().length
  if (count === 0) return null
  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-app-border bg-app-surface p-3.5 text-[15px] leading-snug text-app-secondary">
      <UiIcon name="check" className="mt-px text-app-success" />
      <span>{N.safe(count)}</span>
    </div>
  )
}

const Actions = ({ onTryAgain, onKeepEditing }: Omit<NotConnectedScreenProps, 'anotherDevice'>) => (
  <>
    <Button className="h-[52px] bg-app-text text-base text-app-bg" onClick={onTryAgain}>
      {N.tryAgain}
    </Button>
    <Button variant="outline" className="h-12 text-[15px]" onClick={onKeepEditing}>
      {N.keepEditing}
    </Button>
  </>
)

export const NotConnectedScreen = ({ anotherDevice, ...actions }: NotConnectedScreenProps) => (
  <CenteredState
    icon={<UiIcon name="wifiOff" className="size-8" />}
    title={anotherDevice ? N.anotherDevice : N.title}
    actions={<Actions {...actions} />}
  >
    {anotherDevice ? (
      <p className="text-base text-app-secondary">{N.anotherDeviceBody}</p>
    ) : (
      <Steps />
    )}
    <Reassurance />
  </CenteredState>
)
