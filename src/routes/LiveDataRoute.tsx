import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LiveDataEmpty } from '../components/live-data/LiveDataEmpty'
import { LiveCards } from '../components/live-data/LiveCards'
import { LivePlot } from '../components/live-data/LivePlot'
import { BusSilentNotice } from '../components/states/BusSilentNotice'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useLiveSampler, WINDOW_MAX_S, WINDOW_MIN_S, WINDOW_STEP_S } from '../hooks/useLiveSampler'
import { useSignalStore } from '../stores/signal.store'
import { useDeviceStore } from '../stores/device.store'
import { buildLiveCsv, liveCsvFilename } from '../lib/live-csv'
import { downloadFile } from '../lib/download'

const DEFAULT_WINDOW_S = 30
const CSV_MIME = 'text/csv;charset=utf-8'

const stateLabel = (connected: boolean, simulation: boolean, paused: boolean): string => {
  if (paused) return 'paused'
  if (simulation) return 'simulation · sample data'
  if (connected) return 'listening · live from the bus'
  return 'no device'
}

const LiveDataRoute = () => {
  const signals = useSignalStore((s) => s.signals)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const live = useLiveSignals()
  const navigate = useNavigate()

  const [paused, setPaused] = useState(false)
  const [frozen, setFrozen] = useState<Record<string, number>>({})
  const [windowSeconds, setWindowSeconds] = useState(DEFAULT_WINDOW_S)
  const [selected, setSelected] = useState<string[]>([])

  const values = paused ? frozen : live
  const sampler = useLiveSampler(values, windowSeconds)

  const goToSignals = () => {
    void navigate('/signals')
  }

  const toggle = (name: string) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]
    )
  }

  const stepWindow = (direction: 1 | -1) => {
    setWindowSeconds((current) =>
      Math.min(WINDOW_MAX_S, Math.max(WINDOW_MIN_S, current - direction * WINDOW_STEP_S))
    )
  }

  const stopAndSave = () => {
    const samples = sampler.stopRecording()
    if (samples.length === 0) return
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadFile(liveCsvFilename(stamp), CSV_MIME, buildLiveCsv(signals, samples))
  }

  const meta = useMemo(
    () => stateLabel(connected, simulationMode, paused),
    [connected, simulationMode, paused]
  )

  if (signals.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
        <LiveDataEmpty hasProfile={false} onPickProfile={goToSignals} onCaptureBus={goToSignals} />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <div className="flex h-[54px] shrink-0 items-center gap-4 border-b-2 border-ui-rule px-6">
        <span className="font-mono text-[11px] tracking-[0.18em] text-ui-muted">LIVE DATA</span>
        <span className="whitespace-nowrap font-mono text-[11.5px] text-ui-muted">{meta}</span>
        <div className="flex-1" />
        {sampler.recording && (
          <span className="whitespace-nowrap font-mono text-[11px] text-ui-faint">
            {sampler.recordedCount} samples
          </span>
        )}
        <button
          type="button"
          onClick={sampler.recording ? stopAndSave : sampler.startRecording}
          className={cn(
            'cursor-pointer whitespace-nowrap border px-4 py-[9px] text-[12.5px] font-bold',
            sampler.recording
              ? 'border-ui-accent bg-ui-accent text-white hover:bg-ui-accent-hover'
              : 'border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel'
          )}
        >
          {sampler.recording ? 'STOP & SAVE' : 'RECORD'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFrozen(live)
            setPaused((on) => !on)
          }}
          className="cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-4 py-[9px] text-[12.5px] font-bold text-ui-ink hover:bg-ui-panel"
        >
          {paused ? 'START' : 'PAUSE'}
        </button>
      </div>

      <BusSilentNotice />

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <LiveCards signals={signals} values={values} selected={selected} onToggle={toggle} />
        <LivePlot
          signals={signals}
          selected={selected}
          onToggle={toggle}
          samples={sampler.history}
          windowSeconds={windowSeconds}
          onStepWindow={stepWindow}
        />
      </div>
    </div>
  )
}

export default LiveDataRoute
