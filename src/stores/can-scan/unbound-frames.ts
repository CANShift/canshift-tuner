import type { SignalDef } from '@canshift/core'
import type { CanFrameStats } from './accumulator'
import { parseHexFrameId } from '../../utils/frame-id'

export const boundFrameIds = (signals: readonly SignalDef[]): ReadonlySet<number> => {
  const ids = new Set<number>()
  for (const s of signals) {
    const id = parseHexFrameId(s.canFrameId)
    if (id >= 0) ids.add(id)
  }
  return ids
}

export const unboundFrames = (
  frames: ReadonlyMap<number, CanFrameStats>,
  signals: readonly SignalDef[]
): CanFrameStats[] => {
  const bound = boundFrameIds(signals)
  return Array.from(frames.values())
    .filter((f) => !bound.has(f.id))
    .sort((a, b) => a.id - b.id)
}
