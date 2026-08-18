import type { ReactNode } from 'react'
import { SCREEN_PROFILES } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useDeviceStore } from '../stores/device.store'
import { useObservabilityStore } from '../stores/observability.store'
import { useConnectionStore } from '../stores/connection.store'
import { BrandLockup } from '../components/brand/BrandLockup'
import { Checkbox } from '../components/ui/checkbox'
import { HeapStatsPanel } from '../components/about/HeapStatsPanel'
import { RouteBody } from '../components/ui/route-shell'

const REPO_URL = 'https://github.com/CANShift/canshift-tuner'
const DOCS_URL = 'https://github.com/CANShift/canshift-tuner/tree/main/docs'
const ISSUES_URL = 'https://github.com/CANShift/canshift-tuner/issues'

type ConnectionStatus = ReturnType<typeof useConnectionStore.getState>['status']

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
}

const MAIN_COLUMN = 'flex min-w-0 flex-1 flex-col gap-7 overflow-y-auto p-11 text-brand-text'

const TABLE = 'max-w-[620px] border-t-2 border-solid border-brand-divider'

const factRow = cva('flex justify-between gap-4 py-[13px] text-[14px]', {
  variants: {
    last: { true: '', false: 'border-b border-solid border-brand-neutral-300' },
  },
  defaultVariants: { last: false },
})

const LINK_BUTTON = [
  'border border-solid border-brand-neutral-400 px-[22px] py-3',
  'text-[12px] font-extrabold tracking-[0.08em] text-brand-text no-underline',
].join(' ')

const SIDE_PANEL = [
  'w-[360px] shrink-0 overflow-y-auto',
  'border-l-2 border-solid border-brand-divider bg-brand-neutral-100',
].join(' ')

const SIDE_HEADER = [
  'border-b-2 border-solid border-brand-divider px-5 py-3.5',
  'text-[10px] font-extrabold tracking-[0.2em] text-brand-neutral-600',
].join(' ')

const DIAGNOSTICS_ROW = [
  'flex max-w-[520px] cursor-pointer items-start gap-2.5',
  'text-[12px] leading-[1.5] text-brand-neutral-600',
].join(' ')

const DiagnosticsToggle = () => {
  const enabled = useObservabilityStore((s) => s.enabled)
  const setEnabled = useObservabilityStore((s) => s.setEnabled)
  return (
    <label className={DIAGNOSTICS_ROW}>
      <Checkbox
        checked={enabled}
        onCheckedChange={(checked) => {
          setEnabled(checked === true)
        }}
      />
      <span>
        Share anonymous diagnostics — feature usage, never dashboards or CAN data. Applies
        immediately.
      </span>
    </label>
  )
}

const ContactRoute = () => {
  const tunerVersion = typeof __TUNER_VERSION__ !== 'undefined' ? __TUNER_VERSION__ : 'unknown'
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const portPath = useDeviceStore((s) => s.portPath)
  const status = useConnectionStore((s) => s.status)
  const heapStats = useDeviceStore((s) => s.heapStats)

  const linkLabel = simulationMode
    ? 'Simulation'
    : connected
      ? `USB · ${portPath ?? 'unknown port'}`
      : '—'
  const panels = SCREEN_PROFILES.map((p) => p.name).join(' · ')

  return (
    <RouteBody className="overflow-hidden">
      <div className={MAIN_COLUMN}>
        <BrandLockup height={72} withBaseline />

        <div className={TABLE}>
          <FactRow label="Tuner" value={`${tunerVersion} — web`} />
          <FactRow label="Firmware on device" value={firmwareVersion ?? '—'} />
          <FactRow label="Status" value={prettyStatus(status, simulationMode)} />
          <FactRow label="Link" value={linkLabel} />
          <FactRow label="Supported panels" value={panels} />
          <FactRow label="Licence" value="MIT · github.com/CANShift" last />
        </div>

        <div className="flex gap-3">
          <LinkButton href={DOCS_URL} label="DOCUMENTATION" />
          <LinkButton href={REPO_URL} label="GITHUB" />
          <LinkButton href={ISSUES_URL} label="REPORT A BUG" />
        </div>

        <DiagnosticsToggle />
      </div>

      <aside className={SIDE_PANEL}>
        <div className={SIDE_HEADER}>DEVICE HEAP — LIVE</div>
        <div className="px-5 py-4">
          <HeapStatsPanel history={heapStats} />
        </div>
      </aside>
    </RouteBody>
  )
}

interface FactRowProps {
  label: string
  value: ReactNode
  last?: boolean
}

const FactRow = ({ label, value, last = false }: FactRowProps) => (
  <div className={cn(factRow({ last }))}>
    <span className="text-brand-neutral-600">{label}</span>
    <span className="font-mono text-[13px]">{value}</span>
  </div>
)

interface LinkButtonProps {
  href: string
  label: string
}

const LinkButton = ({ href, label }: LinkButtonProps) => (
  <a href={href} target="_blank" rel="noreferrer" className={cn('shell-link-button', LINK_BUTTON)}>
    {label}
  </a>
)

const prettyStatus = (status: ConnectionStatus, simulationMode: boolean): string => {
  if (simulationMode) return 'Simulation mode'
  return STATUS_LABELS[status]
}

export default ContactRoute
