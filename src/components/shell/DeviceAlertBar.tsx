import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDeviceStore } from '../../stores/device.store'
import { RebootButton } from './RebootButton'
import { formatBytes } from '../../lib/format'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

type Severity = 'critical' | 'warning'

interface Alert {
  id: 'unresponsive' | 'mismatch' | 'heap-low'
  severity: Severity
  title: string
  message: ReactNode
  action: ReactNode | null
  dismissable: boolean
}

const LOW_HEAP_THRESHOLD_BYTES = 10 * 1024

type DeviceState = ReturnType<typeof useDeviceStore.getState>

interface AlertInputs {
  liveness: DeviceState['firmwareLiveness']
  compat: DeviceState['firmwareCompat']
  heapStats: DeviceState['heapStats']
  connected: boolean
  simulationMode: boolean
  heapLowDismissed: boolean
  now: number
}

const unresponsiveAlert = ({ liveness, now }: AlertInputs): Alert | null => {
  if (liveness.kind !== 'unresponsive') return null
  const elapsedSec = Math.max(0, Math.floor((now - liveness.sinceMs) / 1_000))
  return {
    id: 'unresponsive',
    severity: 'critical',
    title: 'Firmware unresponsive',
    message: `Missed ${String(liveness.missedPings)} consecutive pings (${formatElapsed(elapsedSec)} ago). The device is connected but not replying. Try unplug / replug, or reboot.`,
    action: <RebootButton />,
    dismissable: false,
  }
}

const mismatchAlert = ({ compat }: AlertInputs): Alert | null => {
  if (compat.kind !== 'mismatch') return null
  return {
    id: 'mismatch',
    severity: 'critical',
    title: 'Firmware mismatch',
    message: (
      <>
        Tuner expects firmware <strong>v{String(compat.expected)}.x</strong> — device reports{' '}
        <strong>v{compat.version}</strong>. Burn is disabled until the firmware is updated to a
        matching build.
      </>
    ),
    action: null,
    dismissable: false,
  }
}

const heapLowAlert = (inputs: AlertInputs): Alert | null => {
  const { liveness, heapStats, connected, simulationMode, heapLowDismissed } = inputs
  if (!connected || simulationMode || heapLowDismissed) return null
  if (liveness.kind === 'unresponsive') return null
  const latest = heapStats[heapStats.length - 1]
  if (!latest || latest.largestInternal >= LOW_HEAP_THRESHOLD_BYTES) return null
  return {
    id: 'heap-low',
    severity: 'warning',
    title: 'Heap low',
    message: (
      <>
        Largest contiguous free block is <strong>{formatBytes(latest.largestInternal)}</strong> —
        below the {formatBytes(LOW_HEAP_THRESHOLD_BYTES)} safety floor. Subsequent allocations (font
        load, icon decode, JSON parse) may fail silently. Reboot the dash to defragment.
      </>
    ),
    action: <RebootButton />,
    dismissable: true,
  }
}

const buildDeviceAlerts = (inputs: AlertInputs): Alert[] =>
  [unresponsiveAlert(inputs), mismatchAlert(inputs), heapLowAlert(inputs)].filter(
    (alert): alert is Alert => alert !== null
  )

const useTickWhileUnresponsive = (unresponsive: boolean): number => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!unresponsive) return
    const id = window.setInterval(() => {
      setNow(Date.now())
    }, 1_000)
    return () => {
      window.clearInterval(id)
    }
  }, [unresponsive])
  return now
}

const useDeviceAlerts = (heapLowDismissed: boolean): Alert[] => {
  const liveness = useDeviceStore((s) => s.firmwareLiveness)
  const compat = useDeviceStore((s) => s.firmwareCompat)
  const heapStats = useDeviceStore((s) => s.heapStats)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const now = useTickWhileUnresponsive(liveness.kind === 'unresponsive')
  return buildDeviceAlerts({
    liveness,
    compat,
    heapStats,
    connected,
    simulationMode,
    heapLowDismissed,
    now,
  })
}

const MoreToggle = ({
  count,
  expanded,
  onToggle,
}: {
  count: number
  expanded: boolean
  onToggle: () => void
}) =>
  count > 0 ? (
    <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
      {expanded ? 'Hide' : `${String(count)} more`}
    </Button>
  ) : null

export const DeviceAlertBar = () => {
  const [heapLowDismissed, setHeapLowDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [primary, ...rest] = useDeviceAlerts(heapLowDismissed)
  if (!primary) return null
  const handleDismiss = (id: Alert['id']) => {
    if (id === 'heap-low') setHeapLowDismissed(true)
  }
  return (
    <div className="flex shrink-0 flex-col">
      <AlertRow alert={primary} onDismiss={handleDismiss}>
        <MoreToggle
          count={rest.length}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
      </AlertRow>
      {expanded &&
        rest.map((alert) => <AlertRow key={alert.id} alert={alert} onDismiss={handleDismiss} />)}
    </div>
  )
}

interface AlertRowProps {
  alert: Alert
  onDismiss: (id: Alert['id']) => void
  children?: ReactNode
}

const AlertRow = ({ alert, onDismiss, children }: AlertRowProps) => (
  <div role="alert" className={cn(alertRow({ critical: alert.severity === 'critical' }))}>
    <span className="font-bold uppercase tracking-[0.04em]">{alert.title}</span>
    <span className="flex-1">{alert.message}</span>
    {alert.action}
    {children}
    {alert.dismissable && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          onDismiss(alert.id)
        }}
        aria-label={`Dismiss ${alert.title}`}
      >
        ×
      </Button>
    )}
  </div>
)

const formatElapsed = (sec: number): string => {
  if (sec < 60) return `${String(sec)} s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m)} m ${String(s).padStart(2, '0')} s`
}

const alertRow = cva(
  'flex shrink-0 items-center gap-3 border-b px-4 py-2 text-[12px] text-ui-ink',
  {
    variants: {
      critical: {
        true: 'border-destructive bg-ui-danger/[0.18]',
        false: 'border-accent bg-accent/[0.18]',
      },
    },
    defaultVariants: { critical: false },
  }
)
