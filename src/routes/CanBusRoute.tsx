import { useCallback, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useCanScanner } from '../hooks/useCanScanner'
import { CanFrameTable } from '../components/can-bus/CanFrameTable'
import { CanScanToolbar } from '../components/can-bus/CanScanToolbar'
import type { SortKey } from '../components/can-bus/SortBar'
import { useDeviceStore } from '../stores/device.store'
import { useSignalStore } from '../stores/signal.store'
import { useLogStore } from '../stores/log.store'
import { formatFrameIdHex, parseHexFrameId } from '../utils/frame-id'
import { buildDraftSignal, sortFrames } from '../utils/can-frames'

const CanBusRoute = () => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const signals = useSignalStore((s) => s.signals)
  const setSignals = useSignalStore((s) => s.setSignals)
  const log = useLogStore((s) => s.push)
  const scanner = useCanScanner()
  const [sortKey, setSortKey] = useState<SortKey>('id')

  const learn = scanner.snapshot.learn

  const sortedFrames = useMemo(
    () => sortFrames(Array.from(scanner.snapshot.frames.values()), sortKey, learn?.scores ?? null),
    [scanner.snapshot.frames, sortKey, learn]
  )

  const mappedTo = useMemo(() => {
    const map = new Map<number, string>()
    for (const s of signals) {
      const id = parseHexFrameId(s.canFrameId)
      if (id >= 0 && !map.has(id)) map.set(id, s.name)
    }
    return map
  }, [signals])

  const promote = useCallback(
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

  const canControl = connected && !simulationMode

  return (
    <div style={containerStyle}>
      <CanScanToolbar
        status={scanner.status}
        canControl={canControl}
        totalFrames={scanner.snapshot.totalFrames}
        totalRate={scanner.snapshot.totalRate}
        startedAt={scanner.snapshot.startedAt}
        error={scanner.error}
        sortKey={sortKey}
        learn={learn}
        onSortChange={setSortKey}
        onStart={() => {
          void scanner.start()
        }}
        onStop={() => {
          void scanner.stop()
        }}
        onReset={scanner.reset}
        onLearnStart={() => {
          scanner.startLearn()
          setSortKey('activity')
        }}
        onLearnStop={scanner.stopLearn}
      />
      <CanFrameTable
        frames={sortedFrames}
        mappedTo={mappedTo}
        learnScores={learn?.scores ?? null}
        onPromote={promote}
      />
    </div>
  )
}

const containerStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: 'hsl(var(--brand-chrome-bg))',
  overflow: 'hidden',
}

export default CanBusRoute
