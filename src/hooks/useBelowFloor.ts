import { useEffect, useState } from 'react'

export const APP_MIN_WIDTH = 900

const QUERY = `(max-width: ${String(APP_MIN_WIDTH - 1)}px)`

const matches = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY).matches
    : false

export const useBelowFloor = (): boolean => {
  const [below, setBelow] = useState(matches)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      setBelow(event.matches)
    }
    setBelow(query.matches)
    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  return below
}
