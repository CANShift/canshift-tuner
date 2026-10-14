import { useCallback, useMemo, useState } from 'react'
import { useCanScanner } from '../hooks/useCanScanner'
import { CanFrameTable } from '../components/can-bus/CanFrameTable'
import { CanScanToolbar } from '../components/can-bus/CanScanToolbar'
import type { SortKey } from '../components/can-bus/SortBar'
import { useDeviceStore } from '../stores/device.store'
import { useSignalStore } from '../stores/signal.store'
import { useLogStore } from '../stores/log.store'
import { formatFrameIdHex, parseHexFrameId } from '../utils/frame-id'
import { buildDraftSignal, sortFrames } from '../utils/can-frames'
import { RoutePage } from '../components/ui/route-shell'
import { BusSilentNotice } from '../components/states/BusSilentNotice'

const useMappedTo = (): ReadonlyMap<number, string> => {
  const signals = useSignalStore((s) => s.signals)
  return useMemo(() => {
    const map = new Map<number, string>()
    for (const s of signals) {
      const id = parseHexFrameId(s.canFrameId)
      if (id >= 0 && !map.has(id)) map.set(id, s.name)
    }
    return map
  }, [signals])
}

const usePromote = () => {
  const signals = useSignalStore((s) => s.signals)
  const setSignals = useSignalStore((s) => s.setSignals)
  const log = useLogStore((s) => s.push)
  return useCallback(
    (id: number) => {
      const existing = signals.find((s) => parseHexFrameId(s.canFrameId) === id)
      if (existing) {
        log('warn', `Signal "${existing.name}" already bound to ${formatFrameIdHex(id)}`)
        return
      }
      const draft = buildDraftSignal(id, signals.length)
      setSignals([...signals, draft])
      log('success', `Promoted ${formatFrameIdHex(id)} to draft signal "${draft.name}"`)
    },
    [signals, setSignals, log]
  )
}

type Scanner = ReturnType<typeof useCanScanner>

interface ToolbarProps {
  scanner: Scanner
  sortKey: SortKey
  onSortChange: (key: SortKey) => void
}

const ScanToolbar = ({ scanner, sortKey, onSortChange }: ToolbarProps) => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const { snapshot } = scanner
  return (
    <CanScanToolbar
      status={scanner.status}
      canControl={connected && !simulationMode}
      totalFrames={snapshot.totalFrames}
      totalRate={snapshot.totalRate}
      startedAt={snapshot.startedAt}
      error={scanner.error}
      sortKey={sortKey}
      learn={snapshot.learn}
      onSortChange={onSortChange}
      onStart={() => void scanner.start()}
      onStop={() => void scanner.stop()}
      onReset={scanner.reset}
      onLearnStart={() => {
        scanner.startLearn()
        onSortChange('activity')
      }}
      onLearnStop={scanner.stopLearn}
    />
  )
}

const CanBusRoute = () => {
  const scanner = useCanScanner()
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const learn = scanner.snapshot.learn
  const mappedTo = useMappedTo()
  const promote = usePromote()
  const sortedFrames = useMemo(
    () => sortFrames(Array.from(scanner.snapshot.frames.values()), sortKey, learn?.scores ?? null),
    [scanner.snapshot.frames, sortKey, learn]
  )
  return (
    <RoutePage>
      <ScanToolbar scanner={scanner} sortKey={sortKey} onSortChange={setSortKey} />
      <BusSilentNotice />
      <CanFrameTable
        frames={sortedFrames}
        mappedTo={mappedTo}
        learnScores={learn?.scores ?? null}
        onPromote={promote}
      />
    </RoutePage>
  )
}

export default CanBusRoute
