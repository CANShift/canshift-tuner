import { lazy, Suspense, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ECU_PROFILES, OBD2_DEFAULT_INTERVAL_MS, OBD2_MODE01_PIDS } from '@canshift/core'
import { RouteLoading } from '../components/shell/RouteLoading'
import {
  SignalsToolbar,
  SignalsAction,
  type SignalSource,
} from '../components/signals/SignalsToolbar'
import { CanSignalTable } from '../components/signals/CanSignalTable'
import { BusScanPanel } from '../components/signals/BusScanPanel'
import { Obd2Table } from '../components/signals/Obd2Table'
import { useCanScanner } from '../hooks/useCanScanner'
import { useDeviceStore } from '../stores/device.store'
import { formatFrameIdHex, parseHexFrameId } from '../utils/frame-id'
import { useSignalStore } from '../stores/signal.store'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useSignalUsage } from '../hooks/useSignalUsage'
import { useCatalogueIndex } from '../hooks/useCatalogueIndex'
import { ecuLabelForKey } from '../utils/ecu-label'

const EcuRoute = lazy(() => import('./EcuRoute'))
const CanBusRoute = lazy(() => import('./CanBusRoute'))
const DtcPanel = lazy(() =>
  import('../components/obd2/DtcPanel').then((m) => ({ default: m.DtcPanel }))
)

const POLL_INTERVALS = [100, 200, 500, 1000]
type Pane = SignalSource | 'ecu' | 'analysis'

const SignalsRoute = () => {
  const signals = useSignalStore((s) => s.signals)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const applyProfile = useSignalStore((s) => s.applyProfile)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const values = useLiveSignals()
  const usage = useSignalUsage()
  const catalogue = useCatalogueIndex()
  const scanner = useCanScanner()
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)

  const [pane, setPane] = useState<Pane>('can')
  const [filter, setFilter] = useState('')
  const [pollIntervalMs, setPollIntervalMs] = useState(OBD2_DEFAULT_INTERVAL_MS)

  const profiles = useMemo(() => {
    const builtin = ECU_PROFILES.map((profile) => ({
      key: `builtin:${profile.id}`,
      label: profile.name,
    }))
    if (builtin.some((entry) => entry.key === selectedProfileKey)) return builtin
    return [
      { key: selectedProfileKey, label: ecuLabelForKey(selectedProfileKey, catalogue) },
      ...builtin,
    ]
  }, [selectedProfileKey, catalogue])

  const shown = useMemo(() => {
    const query = filter.trim().toLowerCase()
    if (query.length === 0) return signals
    return signals.filter(
      (signal) =>
        signal.name.toLowerCase().includes(query) ||
        signal.canFrameId.toLowerCase().includes(query) ||
        signal.unit.toLowerCase().includes(query)
    )
  }, [signals, filter])

  const bound = useMemo(
    () => signals.filter((signal) => usage.has(signal.name)).length,
    [signals, usage]
  )

  const scanning = scanner.status === 'running' || scanner.status === 'starting'
  const canScan = connected && !simulationMode
  const frames = [...scanner.snapshot.frames.values()].sort((a, b) => a.id - b.id)
  const boundTo = new Map<number, string>()
  for (const signal of signals) {
    const id = parseHexFrameId(signal.canFrameId)
    if (id >= 0 && !boundTo.has(id)) boundTo.set(id, signal.name)
  }

  const panes: Record<Pane, ReactNode> = {
    can: <CanSignalTable signals={shown} values={values} usage={usage} onPatch={updateSignal} />,
    obd2: (
      <div className="flex min-h-0 flex-1 flex-col">
        <Obd2Table
          signals={signals}
          values={values}
          usage={usage}
          intervalMs={pollIntervalMs}
          intervals={POLL_INTERVALS}
          onInterval={setPollIntervalMs}
          onTogglePolled={(name, polled) => {
            const entry = OBD2_MODE01_PIDS.find((pid) => pid.signal === name)
            if (!entry) return
            updateSignal(name, {
              polling: polled ? { mode: 1, pid: entry.pid, intervalMs: pollIntervalMs } : undefined,
            })
          }}
        />
        <div className="shrink-0 border-t-2 border-ui-rule">
          <Suspense fallback={<RouteLoading />}>
            <DtcPanel />
          </Suspense>
        </div>
      </div>
    ),
    ecu: <EcuRoute />,
    analysis: <CanBusRoute />,
  }

  const source: SignalSource = pane === 'obd2' ? 'obd2' : 'can'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <SignalsToolbar
        source={source}
        onSource={setPane}
        profiles={profiles}
        profileKey={selectedProfileKey}
        onProfile={(key) => {
          const id = key.startsWith('builtin:') ? key.slice('builtin:'.length) : null
          const profile = ECU_PROFILES.find((entry) => entry.id === id)
          if (profile) applyProfile(key, [...profile.signals])
        }}
        meta={`${String(bound)} of ${String(signals.length)} bound`}
        filter={filter}
        onFilter={setFilter}
        actions={
          <>
            <SignalsAction
              disabled={!canScan}
              title={canScan ? undefined : 'Plug a dash in — simulation has no bus to listen to.'}
              onClick={() => {
                if (scanning) {
                  void scanner.stop()
                  return
                }
                setPane('can')
                void scanner.start()
              }}
            >
              {scanning ? 'Stop scan' : 'Scan bus'}
            </SignalsAction>
            <SignalsAction
              onClick={() => {
                setPane((current) => (current === 'analysis' ? 'can' : 'analysis'))
              }}
              title="Sort, byte histograms and learn mode — for mapping an unknown ECU"
            >
              {pane === 'analysis' ? 'Back to signals' : 'Analyse…'}
            </SignalsAction>
            <SignalsAction
              onClick={() => {
                setPane((current) => (current === 'ecu' ? 'can' : 'ecu'))
              }}
            >
              {pane === 'ecu' ? 'Back to signals' : 'ECU profile…'}
            </SignalsAction>
          </>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        {frames.length > 0 && pane === 'can' && (
          <BusScanPanel
            frames={frames}
            totalFrames={scanner.snapshot.totalFrames}
            signals={signals}
            boundTo={boundTo}
            onAssign={(frameId, signalName) => {
              updateSignal(signalName, { canFrameId: formatFrameIdHex(frameId) })
            }}
            onClear={scanner.reset}
          />
        )}
        <Suspense fallback={<RouteLoading />}>{panes[pane]}</Suspense>
      </div>
    </div>
  )
}

export default SignalsRoute
