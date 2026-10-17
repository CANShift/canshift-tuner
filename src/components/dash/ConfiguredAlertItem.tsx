import { useState } from 'react'
import type { CriticalAlert, CriticalAlertDirection } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { useCriticalAlertEditor, type CriticalAlertEditor } from '../../hooks/useCriticalAlert'
import { UiIcon } from '../icons/UiIcons'
import { SignalPicker } from '../gauges/SignalPicker'
import { LimitText } from './LimitText'

const D = STRINGS.dash

const ROW = 'flex items-center gap-3'
const LABEL = 'w-[92px] shrink-0 text-[15px] lg:w-[110px]'

const SignalRow = ({ editor }: { editor: CriticalAlertEditor }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={ROW}>
      <span className={LABEL}>{D.alertSignal}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-control border border-app-border bg-app-bg px-3 text-[15px] lg:h-11"
      >
        <span className="truncate">{signalName(editor.alert.signal)}</span>
        <UiIcon name="chevronDown" className="shrink-0 text-app-muted" />
      </button>
      <SignalPicker
        open={open}
        current={editor.alert.signal}
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
      value={editor.alert.direction}
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

export interface ConfiguredAlertItemProps {
  index: number
  alert: CriticalAlert
}

export const ConfiguredAlertItem = ({ index, alert }: ConfiguredAlertItemProps) => {
  const editor = useCriticalAlertEditor(index, alert)
  return (
    <li className="flex flex-col gap-3 border-t border-app-divider pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{D.alertNumber(index + 1)}</span>
        <Button variant="outline" size="sm" onClick={editor.remove}>
          {D.removeAlert}
        </Button>
      </div>
      <SignalRow editor={editor} />
      <DirectionRow editor={editor} />
      <LimitText editor={editor} labelClass={LABEL} inputId={`alert-value-${String(index)}`} />
    </li>
  )
}
