import type { Widget } from '@canshift/core'
import { Input } from '@/components/ui/input'
import { STRINGS } from '../../strings'
import { authoredKicker, derivedKicker } from '../../lib/widget-kicker'

export const DASH_NAME_MAX = 8

export interface NameFieldProps {
  widget: Widget
  onRename: (name: string) => void
}

export const NameField = ({ widget, onRename }: NameFieldProps) => {
  const id = `gauge-name-${widget.id}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex justify-between text-[13px] text-app-muted">
        <span>{STRINGS.gauges.nameOnDash}</span>
        <span>{STRINGS.gauges.nameHint}</span>
      </label>
      <Input
        id={id}
        maxLength={DASH_NAME_MAX}
        value={authoredKicker(widget) ?? ''}
        placeholder={derivedKicker(widget)}
        autoCapitalize="characters"
        onChange={(event) => {
          onRename(event.target.value.toUpperCase())
        }}
        className="h-12 text-base uppercase"
      />
    </div>
  )
}
