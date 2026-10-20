import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import type { LogsAvailability } from '../../stores/session-logs.store'
import { UiIcon, type UiIconName } from '../icons/UiIcons'

const L = STRINGS.sessionLogs

type Unlisted = Exclude<LogsAvailability, 'listed'>

interface StatusCopy {
  icon: UiIconName
  message: string
  retry: boolean
}

const STATUS: Record<Unlisted, StatusCopy> = {
  checking: { icon: 'clock', message: L.checking, retry: false },
  noCard: { icon: 'file', message: L.noCard, retry: true },
  unsupported: { icon: 'chip', message: L.unsupported, retry: false },
  unreachable: { icon: 'wifiOff', message: L.unreachable, retry: true },
  refused: { icon: 'warning', message: L.refused, retry: false },
  notOwner: { icon: 'dash', message: L.notOwner, retry: true },
  noWifi: { icon: 'wifiOff', message: L.noWifi, retry: false },
}

export interface SessionLogsStatusProps {
  availability: Unlisted
  onRetry: () => void
}

export const SessionLogsStatus = ({ availability, onRetry }: SessionLogsStatusProps) => {
  const copy = STATUS[availability]
  return (
    <div
      role="status"
      className="flex flex-col items-start gap-3 rounded-card border border-app-border bg-app-surface p-4 lg:p-5"
    >
      <div className="flex items-start gap-3">
        <UiIcon name={copy.icon} className="mt-0.5 text-app-muted" />
        <p className="text-[15px] leading-normal text-app-secondary">{copy.message}</p>
      </div>
      {copy.retry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <UiIcon name="refresh" />
          {L.retry}
        </Button>
      )}
    </div>
  )
}
