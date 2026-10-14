import type { SignalDef } from '@canshift/core'
import { LiveDataEmpty } from '../components/live-data/LiveDataEmpty'
import { LiveCards } from '../components/live-data/LiveCards'
import { LivePlot } from '../components/live-data/LivePlot'
import { LiveToolbar } from '../components/live-data/LiveToolbar'
import { BusSilentNotice } from '../components/states/BusSilentNotice'
import { useDisplayUnits } from '../hooks/useDisplayUnits'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useLiveSampler, type LiveSampler } from '../hooks/useLiveSampler'
import {
  saveRecording,
  usePausableValues,
  useSignalSelection,
  useTimeWindow,
} from '../hooks/useLiveView'
import { useSignalStore } from '../stores/signal.store'
import { useDeviceStore } from '../stores/device.store'

const useStateLabel = (paused: boolean): string => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  if (paused) return 'paused'
  if (simulationMode) return 'simulation · sample data'
  if (connected) return 'listening · live from the bus'
  return 'no device'
}

interface LiveBodyProps {
  signals: readonly SignalDef[]
  values: Record<string, number>
  sampler: LiveSampler
  windowSeconds: number
  onStepWindow: (direction: 1 | -1) => void
}

const LiveBody = ({ signals, values, sampler, windowSeconds, onStepWindow }: LiveBodyProps) => {
  const units = useDisplayUnits()
  const { selected, toggle } = useSignalSelection()
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-6">
      <LiveCards
        signals={signals}
        values={values}
        units={units}
        selected={selected}
        onToggle={toggle}
      />
      <LivePlot
        signals={signals}
        selected={selected}
        onToggle={toggle}
        samples={sampler.history}
        windowSeconds={windowSeconds}
        onStepWindow={onStepWindow}
      />
    </div>
  )
}

const LiveView = ({ signals }: { signals: readonly SignalDef[] }) => {
  const { values, paused, togglePause } = usePausableValues(useLiveSignals())
  const { windowSeconds, stepWindow } = useTimeWindow()
  const sampler = useLiveSampler(values, windowSeconds)
  const units = useDisplayUnits()
  const meta = useStateLabel(paused)
  const saveAndStop = () => {
    saveRecording(sampler, signals, units)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <LiveToolbar
        meta={meta}
        recording={sampler.recording}
        recordedCount={sampler.recordedCount}
        paused={paused}
        onRecord={sampler.recording ? saveAndStop : sampler.startRecording}
        onTogglePause={togglePause}
      />
      <BusSilentNotice />
      <LiveBody
        signals={signals}
        values={values}
        sampler={sampler}
        windowSeconds={windowSeconds}
        onStepWindow={stepWindow}
      />
    </div>
  )
}

export interface LiveDataRouteProps {
  onShowSignals: () => void
}

const LiveDataRoute = ({ onShowSignals }: LiveDataRouteProps) => {
  const signals = useSignalStore((s) => s.signals)
  if (signals.length > 0) return <LiveView signals={signals} />
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <LiveDataEmpty
        hasProfile={false}
        onPickProfile={onShowSignals}
        onCaptureBus={onShowSignals}
      />
    </div>
  )
}

export default LiveDataRoute
