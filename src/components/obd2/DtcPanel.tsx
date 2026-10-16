import { useState } from 'react'
import { cva } from 'class-variance-authority'
import { dtcSystem } from '@canshift/core'
import { useDtcStore } from '../../stores/dtc.store'
import { useDeviceStore } from '../../stores/device.store'
import { cn } from '@/lib/utils'
import { Eyebrow } from '../ui/eyebrow'
import { DtcClearConfirmDialog } from './DtcClearConfirmDialog'
import { transportErrorText } from '../../transport/humanize-transport-error'

type DtcView = 'unready' | 'reading' | 'unread' | 'empty' | 'codes'

const DTC_MESSAGES: Record<Exclude<DtcView, 'codes'>, string> = {
  unready: 'Connect a dash (or use simulation) to read codes.',
  reading: 'Reading trouble codes…',
  unread: 'Read to fetch stored codes over OBD-II Mode 03.',
  empty: 'No stored trouble codes.',
}

interface DtcViewInputs {
  ready: boolean
  reading: boolean
  hasRead: boolean
  codes: string[]
}

export const dtcView = ({ ready, reading, hasRead, codes }: DtcViewInputs): DtcView => {
  if (!ready) return 'unready'
  if (reading) return 'reading'
  if (!hasRead) return 'unread'
  return codes.length === 0 ? 'empty' : 'codes'
}

const CodeList = ({ codes }: { codes: string[] }) => (
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

const DtcBody = (inputs: DtcViewInputs) => {
  const view = dtcView(inputs)
  if (view === 'codes') return <CodeList codes={inputs.codes} />
  return <div className={EMPTY}>{DTC_MESSAGES[view]}</div>
}

const useDtcPanel = () => {
  const dtc = useDtcStore()
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const ready = connected || simulationMode
  const busy = dtc.status !== 'idle'
  return {
    ...dtc,
    ready,
    canRead: ready && !busy,
    canClear: ready && !busy && dtc.codes.length > 0,
  }
}

type DtcPanelState = ReturnType<typeof useDtcPanel>

const DtcActions = ({
  dtc,
  onClearRequest,
}: {
  dtc: DtcPanelState
  onClearRequest: () => void
}) => (
  <div className="flex gap-2.5 border-t border-brand-neutral-300 px-5 py-3.5">
    <button
      type="button"
      onClick={() => {
        void dtc.read()
      }}
      disabled={!dtc.canRead}
      className={cn(dtcButton({ tone: 'read', enabled: dtc.canRead }))}
    >
      {dtc.status === 'reading' ? 'READING…' : 'READ DTCs'}
    </button>
    <button
      type="button"
      onClick={onClearRequest}
      disabled={!dtc.canClear}
      className={cn(dtcButton({ tone: 'clear', enabled: dtc.canClear }))}
    >
      {dtc.status === 'clearing' ? 'CLEARING…' : 'CLEAR CODES'}
    </button>
  </div>
)

const DtcError = ({ error }: { error: string | null }) =>
  error ? (
    <div className="px-5 py-3 text-[12px] text-brand-accent">
      Failed — {transportErrorText(error)}
    </div>
  ) : null

export const DtcPanel = () => {
  const dtc = useDtcPanel()
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-l-2 border-brand-divider bg-brand-neutral-100">
      <Eyebrow className="block border-b-2 border-brand-divider px-5 py-3.5">TROUBLE CODES</Eyebrow>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <DtcBody
          ready={dtc.ready}
          reading={dtc.status === 'reading'}
          hasRead={dtc.hasRead}
          codes={dtc.codes}
        />
        <DtcError error={dtc.error} />
      </div>
      <DtcActions dtc={dtc} onClearRequest={() => setConfirmOpen(true)} />
      <DtcClearConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        codeCount={dtc.codes.length}
        onConfirm={() => {
          setConfirmOpen(false)
          void dtc.clear()
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
