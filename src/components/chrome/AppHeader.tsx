import { STRINGS } from '../../strings'
import { useConnection } from '../../hooks/useConnection'
import { useSignalStore } from '../../stores/signal.store'
import { TunerMark } from '../brand/TunerMark'
import { ConnectionIndicator } from './ConnectionIndicator'
import { SendButton } from './SendButton'
import { SyncChip } from './SyncChip'

const MARK_HEIGHT = 18

const Brand = () => {
  const { connection } = useConnection()
  const carChosen = useSignalStore((s) => s.carChosen)
  const welcoming = connection === 'offline' || !carChosen
  return (
    <span className="flex items-center gap-2 text-app-text">
      <span className={welcoming ? 'contents' : 'max-lg:hidden'}>
        <TunerMark height={MARK_HEIGHT} />
      </span>
      <span className="hidden text-[17px] font-bold lg:inline">{STRINGS.appName}</span>
    </span>
  )
}

export const AppHeader = () => (
  <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-app-border px-4 lg:h-16 lg:px-6">
    <div className="flex min-w-0 items-center gap-3 lg:gap-5">
      <Brand />
      <span className="lg:hidden">
        <ConnectionIndicator />
      </span>
      <span className="hidden lg:inline">
        <ConnectionIndicator pill />
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="lg:hidden">
        <SyncChip variant="chip" />
      </span>
      <span className="hidden lg:inline">
        <SyncChip variant="text" />
      </span>
      <SendButton className="hidden lg:inline-flex" />
    </div>
  </header>
)
