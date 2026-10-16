import { STRINGS } from '../../strings'
import { useChanges } from '../../hooks/useChanges'
import { useConnection } from '../../hooks/useConnection'
import { SendButton } from './SendButton'

export const SendBar = () => {
  const count = useChanges().length
  const { connection } = useConnection()
  if (count === 0) return null
  const note =
    connection === 'connected' ? STRINGS.sync.onlyInBrowser : STRINGS.sync.inBrowser(count)
  return (
    <div className="flex h-[72px] shrink-0 items-center gap-3 border-t border-app-border bg-app-bg px-4 lg:hidden">
      <span className="flex-1 text-sm text-app-secondary">{note}</span>
      <SendButton className="h-12" />
    </div>
  )
}
