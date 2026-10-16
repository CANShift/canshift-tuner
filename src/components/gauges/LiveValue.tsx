import type { LiveReading } from '../../hooks/useLiveReading'

export const LiveValue = ({ reading }: { reading: LiveReading }) => {
  if (!reading.live) return null
  return (
    <span className="inline-flex items-center gap-1.5 font-num text-sm text-app-secondary">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-app-success" />
      {reading.text}
    </span>
  )
}
