export const KEEP_ALIVE_MS = 3_500

export interface KeepAlive {
  start: (beat: () => void) => void
  stop: () => void
}

export const createKeepAlive = (intervalMs = KEEP_ALIVE_MS): KeepAlive => {
  let timer: ReturnType<typeof setInterval> | null = null
  const stop = () => {
    if (timer !== null) clearInterval(timer)
    timer = null
  }
  return {
    start: (beat) => {
      stop()
      timer = setInterval(beat, intervalMs)
    },
    stop,
  }
}
