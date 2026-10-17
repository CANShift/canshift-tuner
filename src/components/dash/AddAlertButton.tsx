import { useState } from 'react'
import { FIRMWARE_CAPS } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useAddCriticalAlert } from '../../hooks/useCriticalAlert'
import { SignalPicker } from '../gauges/SignalPicker'

const D = STRINGS.dash

export interface AddAlertButtonProps {
  count: number
}

export const AddAlertButton = ({ count }: AddAlertButtonProps) => {
  const [open, setOpen] = useState(false)
  const add = useAddCriticalAlert()
  if (count >= FIRMWARE_CAPS.MAX_CRITICAL_ALERTS) {
    return <p className="text-sm text-app-secondary">{D.alertsFull}</p>
  }
  return (
    <>
      <Button variant="outline" className="self-start" onClick={() => setOpen(true)}>
        {D.addAlert}
      </Button>
      <SignalPicker open={open} current="" onOpenChange={setOpen} onPick={add} />
    </>
  )
}
