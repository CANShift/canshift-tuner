const CONTENTION_WINDOW_MS = 30_000
const CONTENTION_DROPS = 3

export interface ContentionWatch {
  noteDrop: (now: number) => boolean
  reset: () => void
}

export const createContentionWatch = (): ContentionWatch => {
  let drops: number[] = []
  return {
    noteDrop: (now) => {
      drops = [...drops.filter((at) => now - at < CONTENTION_WINDOW_MS), now]
      return drops.length >= CONTENTION_DROPS
    },
    reset: () => {
      drops = []
    },
  }
}
