import { useEffect, useState } from 'react'

export interface AutosavePillProps {
  lastSavedAt: number | null
}

const TICK_MS = 1000

const agoText = (deltaMs: number): string => {
  const sec = Math.max(0, Math.floor(deltaMs / 1000))
  if (sec < 5) return 'saved just now'
  if (sec < 60) return `saved ${String(sec)} s ago`
  const min = Math.floor(sec / 60)
  return `saved ${String(min)} min ago`
}

export const AutosavePill = ({ lastSavedAt }: AutosavePillProps) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (lastSavedAt === null) return
    const id = window.setInterval(() => {
      setNow(Date.now())
    }, TICK_MS)
    return () => {
      window.clearInterval(id)
    }
  }, [lastSavedAt])

  if (lastSavedAt === null) return null

  return (
    <span className="shrink-0 whitespace-nowrap border border-brand-neutral-300 px-[7px] py-0.5 font-mono text-[11px] text-brand-neutral-600">
      {agoText(now - lastSavedAt)}
    </span>
  )
}
