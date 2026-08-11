import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useDeviceStore } from '../../stores/device.store'
import { RebootButton } from './RebootButton'
import { formatBytes } from '../../lib/format'

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
  onFirmwareRoute: boolean
  goToFirmware: () => void
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

const mismatchAlert = ({ compat, onFirmwareRoute, goToFirmware }: AlertInputs): Alert | null => {
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
    action: onFirmwareRoute ? null : (
      <Button type="button" variant="outline" size="sm" onClick={goToFirmware}>
        Open Firmware
      </Button>
    ),
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

export const DeviceAlertBar = () => {
  const liveness = useDeviceStore((s) => s.firmwareLiveness)
  const compat = useDeviceStore((s) => s.firmwareCompat)
  const heapStats = useDeviceStore((s) => s.heapStats)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)

  const [heapLowDismissed, setHeapLowDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (liveness.kind !== 'unresponsive') return
    const id = window.setInterval(() => {
      setNow(Date.now())
    }, 1_000)
    return () => {
      window.clearInterval(id)
    }
  }, [liveness.kind])

  const alerts = buildDeviceAlerts({
    liveness,
    compat,
    heapStats,
    connected,
    simulationMode,
    heapLowDismissed,
    now,
    onFirmwareRoute: location.pathname === '/firmware',
    goToFirmware: () => {
      navigate('/firmware')
    },
  })

  if (alerts.length === 0) return null

  const [primary, ...rest] = alerts
  if (!primary) return null

  const handleDismiss = (id: Alert['id']) => {
    if (id === 'heap-low') setHeapLowDismissed(true)
  }

  return (
    <div style={containerStyle}>
      <AlertRow alert={primary} onDismiss={handleDismiss}>
        {rest.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded((v) => !v)
            }}
          >
            {expanded ? 'Hide' : `${String(rest.length)} more`}
          </Button>
        )}
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
  <div role="alert" style={alert.severity === 'critical' ? criticalStyle : warningStyle}>
    <span style={titleStyle}>{alert.title}</span>
    <span style={messageStyle}>{alert.message}</span>
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

const containerStyle: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
}

const baseRowStyle: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 16px',
  color: 'hsl(var(--text))',
  fontSize: 12,
}

const criticalStyle: CSSProperties = {
  ...baseRowStyle,
  background: 'hsl(var(--destructive) / 0.18)',
  borderBottom: '1px solid hsl(var(--destructive))',
}

const warningStyle: CSSProperties = {
  ...baseRowStyle,
  background: 'hsl(var(--accent) / 0.18)',
  borderBottom: '1px solid hsl(var(--accent))',
}

const titleStyle: CSSProperties = {
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const messageStyle: CSSProperties = {
  flex: 1,
}
