import { useMemo } from 'react'
import type { SignalDef } from '@canshift/core'
import { useCanScanner } from './useCanScanner'
import { useDeviceStore } from '../stores/device.store'
import { parseHexFrameId } from '../utils/frame-id'

const boundFrames = (signals: readonly SignalDef[]): Map<number, string> => {
  const boundTo = new Map<number, string>()
  for (const signal of signals) {
    const id = parseHexFrameId(signal.canFrameId)
    if (id >= 0 && !boundTo.has(id)) boundTo.set(id, signal.name)
  }
  return boundTo
}

export const useBusScan = (signals: readonly SignalDef[]) => {
  const scanner = useCanScanner()
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const scanning = scanner.status === 'running' || scanner.status === 'starting'
  const frames = [...scanner.snapshot.frames.values()].sort((a, b) => a.id - b.id)
  const boundTo = useMemo(() => boundFrames(signals), [signals])
  return { scanner, scanning, canScan: connected && !simulationMode, frames, boundTo }
}
