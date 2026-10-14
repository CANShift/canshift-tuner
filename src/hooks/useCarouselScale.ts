import { useEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SETTLE_EPSILON = 0.01

export interface CarouselScale {
  stripRef: React.RefObject<HTMLDivElement | null>
  scale: number
}

export interface ScreenSize {
  width: number
  height: number
}

const innerWidth = (strip: HTMLElement): number => {
  const style = window.getComputedStyle(strip)
  return strip.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
}

export const fitScale = (available: ScreenSize, screen: ScreenSize): number | null => {
  if (available.width <= 0 || available.height <= 0) return null
  const fit = Math.min(available.width / screen.width, available.height / screen.height)
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, fit))
}

export const useCarouselScale = (screen: ScreenSize, chromeHeight: number): CarouselScale => {
  const stripRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const { width, height } = screen

  useEffect(() => {
    const strip = stripRef.current
    if (strip === null) return

    const measure = () => {
      const available = { width: innerWidth(strip), height: strip.clientHeight - chromeHeight }
      const next = fitScale(available, { width, height })
      if (next === null) return
      setScale((current) => (Math.abs(current - next) < SETTLE_EPSILON ? current : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(strip)
    return () => {
      observer.disconnect()
    }
  }, [width, height, chromeHeight])

  return { stripRef, scale }
}
