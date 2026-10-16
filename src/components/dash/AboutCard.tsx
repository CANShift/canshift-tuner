import { useState } from 'react'
import { Link } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { useDeviceStore } from '../../stores/device.store'
import { UiIcon } from '../icons/UiIcons'
import { ShortcutsDialog } from './ShortcutsDialog'

const D = STRINGS.dash

export const FIRMWARE_PATH = '/dash/firmware'

const ROW =
  'flex min-h-12 items-center gap-3 border-b border-app-divider text-[15px] last:border-b-0 lg:min-h-14'

const ShortcutsRow = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        className={`${ROW} hidden w-full text-left text-app-secondary lg:flex`}
        onClick={() => setOpen(true)}
      >
        <UiIcon name="help" className="text-app-muted" />
        <span className="flex-1">{D.shortcuts}</span>
        <kbd className="font-num text-sm text-app-muted">?</kbd>
      </button>
      <ShortcutsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export const AboutCard = () => {
  const version = useDeviceStore((s) => s.firmwareVersion) ?? D.unknownVersion
  const board = useDeviceStore((s) => s.boardId) ?? D.unknownVersion
  return (
    <section className="flex flex-col rounded-card border border-app-border bg-app-surface px-3.5 lg:px-5">
      <Link to={FIRMWARE_PATH} className={`${ROW} text-app-text no-underline`}>
        <UiIcon name="chip" className="text-app-accent" />
        <span className="flex-1">{STRINGS.firmware.title}</span>
        <span className="text-[13px] text-app-muted lg:text-sm">{D.version(version)}</span>
        <UiIcon name="chevronRight" className="text-app-muted" />
      </Link>
      <div className={`${ROW} text-app-secondary`}>
        <UiIcon name="dash" className="text-app-muted" />
        <span className="flex-1">{D.hardwareLabel}</span>
        <span className="font-num text-sm text-app-muted">{board}</span>
      </div>
      <ShortcutsRow />
    </section>
  )
}
