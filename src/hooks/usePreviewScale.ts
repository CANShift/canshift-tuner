import { useLayoutEffect, useState } from 'react'
import { PHONE_PREVIEW_SCALE, fitPreviewScale, type FitBox } from '../lib/gauges/preview-scale'
import { useIsLaptop } from './useIsLaptop'
import { useScreenProfile } from './useScreenProfile'

export interface PreviewScale {
  columnRef: (node: HTMLElement | null) => void
  scale: number
}

const roomOf = (column: HTMLElement): FitBox => ({
  width: column.clientWidth,
  height: window.innerHeight,
})

const useColumnRoom = (column: HTMLElement | null): FitBox | null => {
  const [room, setRoom] = useState<FitBox | null>(null)
  useLayoutEffect(() => {
    if (column === null) return
    const measure = () => {
      setRoom(roomOf(column))
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(column)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [column])
  return room
}

export const usePreviewScale = (): PreviewScale => {
  const [column, columnRef] = useState<HTMLElement | null>(null)
  const room = useColumnRoom(column)
  const screen = useScreenProfile()
  const isLaptop = useIsLaptop()
  const scale = isLaptop && room !== null ? fitPreviewScale(room, screen) : PHONE_PREVIEW_SCALE
  return { columnRef, scale }
}
