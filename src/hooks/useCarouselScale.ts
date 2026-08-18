import { useEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SETTLE_EPSILON = 0.01

export interface CarouselScale {
  stripRef: React.RefObject<HTMLDivElement | null>
  scale: number
}

export const useCarouselScale = (screenHeight: number, chromeHeight: number): CarouselScale => {
  const stripRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const strip = stripRef.current
    if (strip === null) return

    const measure = () => {
      const available = strip.clientHeight - chromeHeight
      if (available <= 0) return
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, available / screenHeight))
      setScale((current) => (Math.abs(current - next) < SETTLE_EPSILON ? current : next))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(strip)
    return () => {
      observer.disconnect()
    }
  }, [screenHeight, chromeHeight])

  return { stripRef, scale }
}
