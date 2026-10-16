import { useState } from 'react'
import type { Widget } from '@canshift/core'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { useLiveReadings } from '../../hooks/useLiveReading'
import { UiIcon } from '../icons/UiIcons'
import { LiveValue } from './LiveValue'
import { SignalPicker } from './SignalPicker'

export interface ShowsFieldProps {
  widget: Widget
  onPick: (signal: string) => void
}

export const ShowsField = ({ widget, onPick }: ShowsFieldProps) => {
  const [open, setOpen] = useState(false)
  const reading = useLiveReadings()
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] text-app-muted">{STRINGS.gauges.shows}</span>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
        }}
        className="flex h-12 items-center gap-2.5 rounded-control border border-app-border bg-app-bg px-3.5 text-left text-[15px]"
      >
        <span className="flex-1">{signalName(widget.signal)}</span>
        <LiveValue reading={reading(widget.signal)} />
        <UiIcon name="chevronRight" className="text-app-muted" />
      </button>
      <SignalPicker open={open} current={widget.signal} onOpenChange={setOpen} onPick={onPick} />
    </div>
  )
}
