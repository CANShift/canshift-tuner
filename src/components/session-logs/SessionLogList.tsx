import { useState } from 'react'
import { STRINGS } from '../../strings'
import { useSessionLogsStore } from '../../stores/session-logs.store'
import { DeleteLogDialog } from './DeleteLogDialog'
import { SessionLogRow } from './SessionLogRow'

const LogRows = ({ onAskDelete }: { onAskDelete: (name: string) => void }) => {
  const logs = useSessionLogsStore((s) => s.logs)
  const busy = useSessionLogsStore((s) => s.busy)
  const download = useSessionLogsStore((s) => s.download)
  return (
    <ul className="flex flex-col rounded-card border border-app-border bg-app-surface px-3.5 lg:px-5">
      {logs.map((log) => (
        <SessionLogRow
          key={log.name}
          log={log}
          busy={busy === log.name}
          onDownload={(name, format) => void download(name, format)}
          onAskDelete={onAskDelete}
        />
      ))}
    </ul>
  )
}

export const SessionLogList = () => {
  const empty = useSessionLogsStore((s) => s.logs.length === 0)
  const remove = useSessionLogsStore((s) => s.remove)
  const [asked, setAsked] = useState<string | null>(null)
  if (empty) return <p className="text-sm text-app-muted">{STRINGS.sessionLogs.empty}</p>
  return (
    <>
      <LogRows onAskDelete={setAsked} />
      <DeleteLogDialog
        name={asked}
        onDelete={(name) => {
          setAsked(null)
          void remove(name)
        }}
        onCancel={() => setAsked(null)}
      />
    </>
  )
}
