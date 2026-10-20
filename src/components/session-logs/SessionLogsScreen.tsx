import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { useSessionLogsStore } from '../../stores/session-logs.store'
import { UiIcon } from '../icons/UiIcons'
import { SessionLogList } from './SessionLogList'
import { SessionLogsStatus } from './SessionLogsStatus'

const L = STRINGS.sessionLogs

const SessionLogsBody = () => {
  const availability = useSessionLogsStore((s) => s.availability)
  const load = useSessionLogsStore((s) => s.load)
  if (availability === 'listed') return <SessionLogList />
  return <SessionLogsStatus availability={availability} onRetry={() => void load()} />
}

const SessionLogsScreen = () => {
  const load = useSessionLogsStore((s) => s.load)
  useEffect(() => {
    void load()
  }, [load])
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-4 pt-2 lg:p-8">
        <Link
          to="/dash"
          className="inline-flex h-11 items-center gap-1 self-start text-[15px] text-app-secondary no-underline"
        >
          <UiIcon name="chevronLeft" />
          {STRINGS.tabs.dash}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{L.title}</h1>
          <p className="text-[15px] text-app-muted">{L.intro}</p>
        </div>
        <SessionLogsBody />
      </div>
    </div>
  )
}

export default SessionLogsScreen
