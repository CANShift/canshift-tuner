import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import type { SessionLog } from '../../transport/session-logs-http'
import type { LogFormat } from '../../stores/session-logs.store'
import { UiIcon } from '../icons/UiIcons'

const L = STRINGS.sessionLogs

export interface SessionLogRowProps {
  log: SessionLog
  busy: boolean
  onDownload: (name: string, format: LogFormat) => void
  onAskDelete: (name: string) => void
}

const LogHeading = ({ log, busy, onAskDelete }: Omit<SessionLogRowProps, 'onDownload'>) => (
  <div className="flex items-center gap-3">
    <UiIcon name="file" className="text-app-muted" />
    <span className="flex-1 font-num text-[15px]">{log.name}</span>
    <span className="font-num text-[13px] text-app-muted">{L.size(log.bytes)}</span>
    <Button
      variant="ghost"
      size="icon"
      className="-mr-2 text-app-muted"
      disabled={busy}
      aria-label={L.removeTitle(log.name)}
      onClick={() => onAskDelete(log.name)}
    >
      <UiIcon name="trash" />
    </Button>
  </div>
)

const LogActions = ({ log, busy, onDownload }: Omit<SessionLogRowProps, 'onAskDelete'>) => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant="secondary"
      size="sm"
      disabled={busy}
      onClick={() => onDownload(log.name, 'csv')}
    >
      <UiIcon name="download" />
      {L.downloadCsv}
    </Button>
    <Button variant="outline" size="sm" disabled={busy} onClick={() => onDownload(log.name, 'raw')}>
      {L.downloadRaw}
    </Button>
  </div>
)

export const SessionLogRow = (props: SessionLogRowProps) => (
  <li className="flex flex-col gap-1.5 border-b border-app-divider py-2.5 last:border-b-0">
    <LogHeading log={props.log} busy={props.busy} onAskDelete={props.onAskDelete} />
    <LogActions {...props} />
  </li>
)
