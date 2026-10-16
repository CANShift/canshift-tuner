import { useState } from 'react'
import type { CriticalAlertDirection } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { useCriticalAlert, type CriticalAlertEditor } from '../../hooks/useCriticalAlert'
import { UiIcon } from '../icons/UiIcons'
import { SignalPicker } from '../gauges/SignalPicker'
import { LimitText } from './LimitText'

const D = STRINGS.dash

const ROW = 'flex items-center gap-3'
const LABEL = 'w-[92px] shrink-0 text-[15px] lg:w-[110px]'

const SignalRow = ({ editor }: { editor: CriticalAlertEditor }) => {
  const [open, setOpen] = useState(false)
  const name = editor.alert === undefined ? D.chooseSignal : signalName(editor.alert.signal)
  return (
    <div className={ROW}>
      <span className={LABEL}>{D.alertSignal}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 flex-1 items-center justify-between rounded-control border border-app-border bg-app-bg px-3 text-[15px] lg:h-11"
      >
        {name}
        <UiIcon name="chevronDown" className="text-app-muted" />
      </button>
      <SignalPicker
        open={open}
        current={editor.alert?.signal ?? ''}
        onOpenChange={setOpen}
        onPick={editor.setSignal}
      />
    </div>
  )
}

const DirectionRow = ({ editor }: { editor: CriticalAlertEditor }) => (
  <div className={ROW}>
    <span className={LABEL}>{D.alertWhen}</span>
    <ToggleGroup
      type="single"
      aria-label={D.alertWhen}
      value={editor.alert?.direction ?? 'above'}
      onValueChange={(value) =>
        value.length > 0 && editor.setDirection(value as CriticalAlertDirection)
      }
      className="grid flex-1 grid-cols-2"
    >
      <ToggleGroupItem value="below">{D.below}</ToggleGroupItem>
      <ToggleGroupItem value="above">{D.above}</ToggleGroupItem>
    </ToggleGroup>
  </div>
)

const AlertFields = ({ editor }: { editor: CriticalAlertEditor }) => {
  if (editor.alert === undefined) return <p className="text-sm text-app-secondary">{D.alertNone}</p>
  return (
    <>
      <DirectionRow editor={editor} />
      <LimitText editor={editor} labelClass={LABEL} />
      <Button variant="outline" className="self-start" onClick={editor.turnOff}>
        {D.off}
      </Button>
    </>
  )
}

export const AlertCard = () => {
  const editor = useCriticalAlert()
  return (
    <section
      aria-label={D.alert}
      className="flex flex-col overflow-hidden rounded-card border-2 border-app-primary bg-app-surface"
    >
      <div className="flex min-h-11 items-center gap-2.5 bg-app-primary px-3.5 text-white lg:min-h-12 lg:px-5">
        <UiIcon name="fullScreen" />
        <span className="text-base font-bold lg:text-[17px]">{D.alert}</span>
      </div>
      <div className="flex flex-col gap-3 px-3.5 pb-3 pt-2.5 lg:px-5 lg:pb-5 lg:pt-4">
        <p className="text-[13px] leading-snug text-app-secondary lg:text-sm">{D.alertHint}</p>
        <SignalRow editor={editor} />
        <AlertFields editor={editor} />
      </div>
    </section>
  )
}
