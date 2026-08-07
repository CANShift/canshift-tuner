import type { SignalDef } from '@canshift/core'
import type { CanFrameStats } from '../hooks/useCanScanner'
import type { SortKey } from '../components/can-bus/SortBar'
import { formatFrameIdHex } from './frame-id'

const DRAFT_SIGNAL_TIMEOUT_MS = 2_000
const DRAFT_SIGNAL_MAX = 255

export const sortFrames = (
  frames: CanFrameStats[],
  key: SortKey,
  learnScores: ReadonlyMap<number, number> | null
): CanFrameStats[] => {
  const sorted = frames.slice()
  switch (key) {
    case 'id':
      return sorted.sort((a, b) => a.id - b.id)
    case 'lastSeen':
      return sorted.sort((a, b) => b.lastSeenMs - a.lastSeenMs)
    case 'rate':
      return sorted.sort((a, b) => b.rateHz - a.rateHz)
    case 'count':
      return sorted.sort((a, b) => b.count - a.count)
    case 'activity':
      return sorted.sort(
        (a, b) => (learnScores?.get(b.id) ?? 0) - (learnScores?.get(a.id) ?? 0) || a.id - b.id
      )
  }
}

export const buildDraftSignal = (id: number, existingCount: number): SignalDef => ({
  name: `scan_signal_${String(existingCount + 1)}`,
  canFrameId: formatFrameIdHex(id),
  startByte: 0,
  byteLength: 1,
  bigEndian: false,
  signed: false,
  scale: 1,
  offset: 0,
  unit: '',
  min: 0,
  max: DRAFT_SIGNAL_MAX,
  timeoutMs: DRAFT_SIGNAL_TIMEOUT_MS,
})
