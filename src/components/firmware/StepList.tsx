import { cn } from '@/lib/utils'
import { STRINGS } from '../../strings'
import type { FirmwareStep } from '../../stores/firmware.store'
import { UiIcon } from '../icons/UiIcons'

const F = STRINGS.firmware

const ORDER: readonly FirmwareStep[] = ['upload', 'signature', 'install', 'restart']

const LABELS: Record<FirmwareStep, string> = {
  upload: F.stepUpload,
  signature: F.stepSignature,
  install: F.stepInstall,
  restart: F.stepRestartDash,
}

export interface StepListProps {
  step: FirmwareStep
  note: string
}

const Mark = ({ done, current }: { done: boolean; current: boolean }) => (
  <span
    className={cn(
      'grid size-6 shrink-0 place-items-center rounded-full',
      done || current ? 'bg-app-text text-app-bg' : 'border-2 border-[#3a3f46]'
    )}
  >
    {done && <UiIcon name="check" className="size-4" />}
  </span>
)

export const StepList = ({ step, note }: StepListProps) => {
  const at = ORDER.indexOf(step)
  return (
    <ol className="flex flex-col gap-4 text-base">
      {ORDER.map((candidate, index) => (
        <li
          key={candidate}
          className={cn('flex items-center gap-3', index > at && 'text-app-muted')}
        >
          <Mark done={index < at} current={index === at} />
          <span className={index === at ? 'font-semibold' : ''}>{LABELS[candidate]}</span>
          {index === at && <span className="ml-auto text-sm text-app-muted">{note}</span>}
        </li>
      ))}
    </ol>
  )
}
