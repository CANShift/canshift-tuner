import { useState } from 'react'
import { STRINGS } from '../../strings'
import { ObdSheet } from './ObdSheet'
import { ROW_LINK, RowLinkLabel } from './RowLinkLabel'

export const ObdLink = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={ROW_LINK} onClick={() => setOpen(true)}>
        <RowLinkLabel title={STRINGS.car.obd} hint={STRINGS.car.obdHint} />
      </button>
      <ObdSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
