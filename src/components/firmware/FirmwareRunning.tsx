import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { STRINGS } from '../../strings'
import { useFirmwareStore, type FirmwareView } from '../../stores/firmware.store'
import { UiIcon } from '../icons/UiIcons'
import { StepList } from './StepList'

const F = STRINGS.firmware

const PERCENT = 100

type Running = Extract<FirmwareView, { kind: 'running' }>

const percentOf = (view: Running): number =>
  view.total === 0 ? 0 : Math.round((view.sent / view.total) * PERCENT)

const CancelUpload = () => {
  const cancel = useFirmwareStore((s) => s.cancelUpload)
  return (
    <div className="mt-auto flex flex-col items-center gap-1.5">
      <Button variant="outline" className="h-12 w-full text-[15px]" onClick={cancel}>
        {F.cancelUpload}
      </Button>
      <span className="text-[13px] text-app-muted">{F.cancelHint}</span>
    </div>
  )
}

export const FirmwareRunning = ({ view }: { view: Running }) => {
  const version = useFirmwareStore((s) => s.bin?.info.version ?? '')
  const percent = percentOf(view)
  const note = view.step === 'upload' ? F.megabytes(view.sent, view.total) : ''
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] text-app-muted">{F.updatingTo(version)}</span>
        <span className="font-num text-[56px] font-bold leading-none">{`${String(percent)}%`}</span>
      </div>
      <ProgressBar percent={percent} label={F.updating(percent)} />
      <StepList step={view.step} note={note} />
      <p className="flex items-start gap-3 rounded-[12px] bg-app-warning-bg p-3.5 text-[15px] leading-snug text-app-warning-ink">
        <UiIcon name="warning" />
        {F.keepOpen}
      </p>
      {view.step === 'upload' && <CancelUpload />}
    </>
  )
}
