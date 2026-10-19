import { useState } from 'react'
import { dtcSystem } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useDtcStore } from '../../stores/dtc.store'
import { useDeviceStore } from '../../stores/device.store'
import { DtcClearConfirmDialog } from './DtcClearConfirmDialog'
import { transportErrorText } from '../../transport/humanize-transport-error'

const C = STRINGS.car

type DtcView = 'unready' | 'reading' | 'unread' | 'empty' | 'codes'

const DTC_MESSAGES: Record<Exclude<DtcView, 'codes'>, string> = {
  unready: 'Connect a dash (or use simulation) to read codes.',
  reading: 'Reading trouble codes…',
  unread: 'Read to fetch the codes the car has stored.',
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
  <ul className="overflow-hidden rounded-card border border-app-border">
    {codes.map((code) => (
      <li
        key={code}
        className="flex min-h-12 items-center justify-between gap-3 border-b border-app-divider px-4 last:border-b-0"
      >
        <span className="font-num text-[15px] tabular-nums text-app-warning">{code}</span>
        <span className="text-[13px] text-app-muted capitalize">{dtcSystem(code)}</span>
      </li>
    ))}
  </ul>
)

const DtcBody = (inputs: DtcViewInputs) => {
  const view = dtcView(inputs)
  if (view === 'codes') return <CodeList codes={inputs.codes} />
  return <p className="text-sm text-app-muted">{DTC_MESSAGES[view]}</p>
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

interface DtcActionsProps {
  dtc: DtcPanelState
  onClearRequest: () => void
}

const DtcActions = ({ dtc, onClearRequest }: DtcActionsProps) => (
  <div className="flex flex-wrap gap-2.5">
    <Button
      variant="secondary"
      onClick={() => {
        void dtc.read()
      }}
      disabled={!dtc.canRead}
    >
      {dtc.status === 'reading' ? C.readingCodes : C.readCodes}
    </Button>
    <Button variant="outline" onClick={onClearRequest} disabled={!dtc.canClear}>
      {dtc.status === 'clearing' ? C.clearingCodes : C.clearCodes}
    </Button>
  </div>
)

const DtcError = ({ error }: { error: string | null }) =>
  error ? (
    <p className="text-sm text-app-warning">{C.codesFailed(transportErrorText(error))}</p>
  ) : null

export const DtcPanel = () => {
  const dtc = useDtcPanel()
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <section className="flex flex-col gap-3 border-t border-app-divider pt-4">
      <h3 className="text-[15px] font-bold">{C.troubleCodes}</h3>
      <DtcBody
        ready={dtc.ready}
        reading={dtc.status === 'reading'}
        hasRead={dtc.hasRead}
        codes={dtc.codes}
      />
      <DtcError error={dtc.error} />
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
    </section>
  )
}
