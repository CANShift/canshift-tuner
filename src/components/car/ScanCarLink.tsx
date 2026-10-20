import { useState } from 'react'
import { STRINGS } from '../../strings'
import { ROW_LINK, RowLinkLabel } from './RowLinkLabel'
import { ScanCarSheet } from './ScanCarSheet'

export const ScanCarLink = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={ROW_LINK} onClick={() => setOpen(true)}>
        <RowLinkLabel title={STRINGS.carScan.title} hint={STRINGS.carScan.hint} />
      </button>
      <ScanCarSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
