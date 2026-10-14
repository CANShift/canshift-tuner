import type { SignalDef } from '@canshift/core'
import { parseHexFrameId } from '../utils/frame-id'

export interface SignalFrame {
  frameId: string
  signals: readonly SignalDef[]
}

const UNKNOWN_FRAME_ORDER = Number.MAX_SAFE_INTEGER

const frameOrder = (frameId: string): number => {
  const id = parseHexFrameId(frameId)
  return id < 0 ? UNKNOWN_FRAME_ORDER : id
}

export const groupByFrame = (signals: readonly SignalDef[]): SignalFrame[] => {
  const frames = new Map<string, SignalDef[]>()
  for (const signal of signals) {
    const members = frames.get(signal.canFrameId) ?? []
    frames.set(signal.canFrameId, [...members, signal])
  }
  return [...frames.entries()]
    .map(([frameId, members]) => ({ frameId, signals: members }))
    .sort((a, b) => frameOrder(a.frameId) - frameOrder(b.frameId))
}
