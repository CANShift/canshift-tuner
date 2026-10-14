export const RATE_WINDOW_MS = 1_000
export const MAX_PAYLOAD_BYTES = 8

export interface CanFrame {
  id: number
  len: number
  data: number[]
}

export interface CanFrameStats {
  readonly id: number
  readonly firstSeenMs: number
  readonly lastSeenMs: number
  readonly count: number
  readonly rateHz: number
  readonly lastDlc: number
  readonly lastPayload: readonly number[]
  readonly byteValueCounts: ReadonlyArray<ReadonlyMap<number, number>>
}

export interface LearnWindow {
  active: boolean
  scores: ReadonlyMap<number, number>
}

export interface CanScanSnapshot {
  startedAt: number | null
  totalFrames: number
  totalRate: number
  frames: ReadonlyMap<number, CanFrameStats>
  learn: LearnWindow | null
}

interface MutableFrameStats {
  id: number
  firstSeenMs: number
  lastSeenMs: number
  count: number
  recentMs: number[]
  lastDlc: number
  lastPayload: number[]
  byteValueCounts: Map<number, number>[]
  dirty: boolean
}

export interface ScanAccumulator {
  ingest: (frame: CanFrame, nowMs: number) => void
  snapshot: (nowMs: number) => CanScanSnapshot
  markStarted: (nowMs: number) => void
  totalFrames: () => number
  startLearn: () => void
  stopLearn: () => void
  clearLearn: () => void
  reset: () => void
}

export const emptySnapshot = (): CanScanSnapshot => ({
  startedAt: null,
  totalFrames: 0,
  totalRate: 0,
  frames: new Map(),
  learn: null,
})

const payloadsDiffer = (a: readonly number[], b: readonly number[]): boolean =>
  a.length !== b.length || a.some((byte, i) => byte !== b[i])

const trimRecent = (recent: number[], nowMs: number): void => {
  while (recent.length > 0 && nowMs - (recent[0] ?? 0) > RATE_WINDOW_MS) recent.shift()
}

const newStats = (frame: CanFrame, nowMs: number): MutableFrameStats => ({
  id: frame.id,
  firstSeenMs: nowMs,
  lastSeenMs: nowMs,
  count: 0,
  recentMs: [],
  lastDlc: frame.len,
  lastPayload: [],
  byteValueCounts: Array.from({ length: MAX_PAYLOAD_BYTES }, () => new Map<number, number>()),
  dirty: true,
})

const countBytes = (stats: MutableFrameStats, payload: readonly number[]): void => {
  payload.forEach((byte, index) => {
    const counts = stats.byteValueCounts[index]
    counts?.set(byte, (counts.get(byte) ?? 0) + 1)
  })
}

const recordFrame = (
  stats: MutableFrameStats,
  frame: CanFrame,
  payload: number[],
  nowMs: number
): void => {
  stats.count += 1
  stats.lastSeenMs = nowMs
  stats.lastDlc = frame.len
  stats.lastPayload = payload
  stats.recentMs.push(nowMs)
  stats.dirty = true
  countBytes(stats, payload)
}

const frozenStats = (m: MutableFrameStats, rateHz: number): CanFrameStats => ({
  id: m.id,
  firstSeenMs: m.firstSeenMs,
  lastSeenMs: m.lastSeenMs,
  count: m.count,
  rateHz,
  lastDlc: m.lastDlc,
  lastPayload: m.lastPayload.slice(),
  byteValueCounts: m.byteValueCounts.map((counts) => new Map(counts)),
})

class Accumulator implements ScanAccumulator {
  private frames = new Map<number, MutableFrameStats>()
  private emitted = new Map<number, CanFrameStats>()
  private total = 0
  private totalRecent: number[] = []
  private startedAt: number | null = null
  private learnScores: Map<number, number> | null = null
  private learnActive = false

  ingest = (frame: CanFrame, nowMs: number): void => {
    this.total += 1
    this.totalRecent.push(nowMs)
    const stats = this.statsFor(frame, nowMs)
    const payload = frame.data.slice(0, MAX_PAYLOAD_BYTES)
    this.scoreChange(stats, payload)
    recordFrame(stats, frame, payload, nowMs)
  }

  snapshot = (nowMs: number): CanScanSnapshot => {
    trimRecent(this.totalRecent, nowMs)
    const next = new Map<number, CanFrameStats>()
    for (const [id, m] of this.frames) next.set(id, this.emit(id, m, nowMs))
    this.emitted = next
    return {
      startedAt: this.startedAt,
      totalFrames: this.total,
      totalRate: this.totalRecent.length,
      frames: next,
      learn: this.learnWindow(),
    }
  }

  startLearn = (): void => {
    this.learnScores = new Map()
    this.learnActive = true
  }

  stopLearn = (): void => {
    this.learnActive = false
  }

  clearLearn = (): void => {
    this.learnScores = null
    this.learnActive = false
  }

  markStarted = (nowMs: number): void => {
    this.startedAt = nowMs
  }

  totalFrames = (): number => this.total

  reset = (): void => {
    this.frames = new Map()
    this.emitted = new Map()
    this.total = 0
    this.totalRecent = []
    this.startedAt = null
    this.clearLearn()
  }

  private statsFor(frame: CanFrame, nowMs: number): MutableFrameStats {
    const existing = this.frames.get(frame.id)
    if (existing) return existing
    const created = newStats(frame, nowMs)
    this.frames.set(frame.id, created)
    return created
  }

  private scoreChange(stats: MutableFrameStats, payload: readonly number[]): void {
    const scores = this.learnScores
    if (!this.learnActive || scores === null || stats.count === 0) return
    if (!payloadsDiffer(stats.lastPayload, payload)) return
    scores.set(stats.id, (scores.get(stats.id) ?? 0) + 1)
  }

  private emit(id: number, m: MutableFrameStats, nowMs: number): CanFrameStats {
    trimRecent(m.recentMs, nowMs)
    const rateHz = m.recentMs.length
    const previous = this.emitted.get(id)
    const unchanged = previous !== undefined && !m.dirty && previous.rateHz === rateHz
    m.dirty = false
    return unchanged ? previous : frozenStats(m, rateHz)
  }

  private learnWindow(): LearnWindow | null {
    if (this.learnScores === null) return null
    return { active: this.learnActive, scores: new Map(this.learnScores) }
  }
}

export const createScanAccumulator = (): ScanAccumulator => new Accumulator()
