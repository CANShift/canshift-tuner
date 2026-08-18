import { useEffect, useRef, useState } from 'react'
import { useFlasherStore } from '../stores/flasher.store'
import type { FlasherState } from '../stores/flasher.store'
import { flashProgress, type FlashProgress } from '../lib/firmware/flash-steps'

const TICK_MS = 200

const phaseKey = (state: FlasherState): string => {
  if (state.kind !== 'flashing') return state.kind
  if (state.written <= 0 || state.total <= 0) return 'handshake'
  return state.written >= state.total ? 'settle' : 'write'
}

export const useFlashProgress = (): FlashProgress => {
  const state = useFlasherStore((s) => s.state)
  const phase = phaseKey(state)
  const startedAt = useRef(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    startedAt.current = Date.now()
    setElapsedMs(0)
  }, [phase])

  useEffect(() => {
    if (state.kind !== 'flashing') return undefined
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current)
    }, TICK_MS)
    return () => {
      clearInterval(timer)
    }
  }, [state.kind])

  return flashProgress(state, elapsedMs)
}
