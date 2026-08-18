import { lazy, Suspense, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ECU_PROFILES } from '@canshift/core'
import { RouteLoading } from '../components/shell/RouteLoading'
import {
  SignalsToolbar,
  SignalsAction,
  type SignalSource,
} from '../components/signals/SignalsToolbar'
import { CanSignalTable } from '../components/signals/CanSignalTable'
import { useSignalStore } from '../stores/signal.store'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useSignalUsage } from '../hooks/useSignalUsage'
import { useCatalogueIndex } from '../hooks/useCatalogueIndex'
import { ecuLabelForKey } from '../utils/ecu-label'

const CanBusRoute = lazy(() => import('./CanBusRoute'))
const EcuRoute = lazy(() => import('./EcuRoute'))
const Obd2Route = lazy(() => import('./Obd2Route'))

type Pane = SignalSource | 'scan' | 'ecu'

const SignalsRoute = () => {
  const signals = useSignalStore((s) => s.signals)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const applyProfile = useSignalStore((s) => s.applyProfile)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const values = useLiveSignals()
  const usage = useSignalUsage()
  const catalogue = useCatalogueIndex()

  const [pane, setPane] = useState<Pane>('can')
  const [filter, setFilter] = useState('')

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

  const panes: Record<Pane, ReactNode> = {
    can: <CanSignalTable signals={shown} values={values} usage={usage} onPatch={updateSignal} />,
    obd2: <Obd2Route />,
    scan: <CanBusRoute />,
    ecu: <EcuRoute />,
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
              onClick={() => {
                setPane((current) => (current === 'scan' ? 'can' : 'scan'))
              }}
            >
              {pane === 'scan' ? 'Back to signals' : 'Scan bus'}
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
        <Suspense fallback={<RouteLoading />}>{panes[pane]}</Suspense>
      </div>
    </div>
  )
}

export default SignalsRoute
