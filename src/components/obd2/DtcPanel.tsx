import { useState } from 'react'
import { cva } from 'class-variance-authority'
import { dtcSystem } from '@canshift/core'
import { useDtcStore } from '../../stores/dtc.store'
import { useDeviceStore } from '../../stores/device.store'
import { cn } from '@/lib/utils'
import { Eyebrow } from '../ui/meta-text'
import { DtcClearConfirmDialog } from './DtcClearConfirmDialog'
import { transportErrorText } from '../../transport/humanize-transport-error'

interface DtcBodyProps {
  ready: boolean
  reading: boolean
  hasRead: boolean
  codes: string[]
}

const DtcBody = ({ ready, reading, hasRead, codes }: DtcBodyProps) => {
  if (!ready) return <div className={EMPTY}>Connect a dash (or use simulation) to read codes.</div>
  if (reading) return <div className={EMPTY}>Reading trouble codes…</div>
  if (!hasRead) return <div className={EMPTY}>Read to fetch stored codes over OBD-II Mode 03.</div>
  if (codes.length === 0) return <div className={EMPTY}>No stored trouble codes.</div>
  return (
    <ul className="m-0 list-none p-0">
      {codes.map((code) => (
        <li
          key={code}
          className="flex items-baseline justify-between gap-3 border-b border-brand-neutral-300 px-5 py-2.5"
        >
          <span className="font-mono text-[14px] font-bold tabular-nums text-brand-accent">
            {code}
          </span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-brand-neutral-600">
            {dtcSystem(code)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export const DtcPanel = () => {
  const codes = useDtcStore((s) => s.codes)
  const hasRead = useDtcStore((s) => s.hasRead)
  const status = useDtcStore((s) => s.status)
  const error = useDtcStore((s) => s.error)
  const read = useDtcStore((s) => s.read)
  const clear = useDtcStore((s) => s.clear)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const ready = connected || simulationMode
  const busy = status !== 'idle'
  const canRead = ready && !busy
  const canClear = ready && !busy && codes.length > 0

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l-2 border-brand-divider bg-brand-neutral-100">
      <Eyebrow className="block border-b-2 border-brand-divider px-5 py-3.5">TROUBLE CODES</Eyebrow>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <DtcBody ready={ready} reading={status === 'reading'} hasRead={hasRead} codes={codes} />
        {error && (
          <div className="px-5 py-3 text-[12px] text-brand-accent">
            Failed — {transportErrorText(error)}
          </div>
        )}
      </div>
      <div className="flex gap-2.5 border-t border-brand-neutral-300 px-5 py-3.5">
        <button
          type="button"
          onClick={() => {
            void read()
          }}
          disabled={!canRead}
          className={cn(dtcButton({ tone: 'read', enabled: canRead }))}
        >
          {status === 'reading' ? 'READING…' : 'READ DTCs'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirmOpen(true)
          }}
          disabled={!canClear}
          className={cn(dtcButton({ tone: 'clear', enabled: canClear }))}
        >
          {status === 'clearing' ? 'CLEARING…' : 'CLEAR CODES'}
        </button>
      </div>
      <DtcClearConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        codeCount={codes.length}
        onConfirm={() => {
          setConfirmOpen(false)
          void clear()
        }}
      />
    </aside>
  )
}

const EMPTY = 'px-5 py-4 text-[12px] leading-[1.5] text-brand-neutral-500'

const dtcButton = cva(
  'border border-brand-accent px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.09em]',
  {
    variants: {
      tone: {
        read: '',
        clear: 'bg-transparent text-brand-accent',
      },
      enabled: {
        true: 'cursor-pointer opacity-100',
        false: 'cursor-not-allowed opacity-50',
      },
    },
    compoundVariants: [
      { tone: 'read', enabled: true, class: 'bg-brand-accent text-white' },
      { tone: 'read', enabled: false, class: 'bg-transparent text-brand-neutral-500' },
    ],
    defaultVariants: { enabled: false },
  }
)
