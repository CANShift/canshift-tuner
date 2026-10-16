import { useSyncExternalStore } from 'react'

const LAPTOP_QUERY = '(min-width: 1024px)'

const query = (): MediaQueryList | null =>
  typeof window === 'undefined' || typeof window.matchMedia !== 'function'
    ? null
    : window.matchMedia(LAPTOP_QUERY)

const subscribe = (onChange: () => void): (() => void) => {
  const list = query()
  list?.addEventListener('change', onChange)
  return () => list?.removeEventListener('change', onChange)
}

const snapshot = (): boolean => query()?.matches ?? false

export const useIsLaptop = (): boolean => useSyncExternalStore(subscribe, snapshot, () => false)
