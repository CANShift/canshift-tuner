import type { ReactNode } from 'react'
import type { BenchEntry } from '../../lib/bench-entry'
import { BenchPanel } from '../welcome/BenchPanel'
import { ConnectColumn } from '../welcome/ConnectColumn'

export interface WelcomeScreenProps {
  entries: BenchEntry[]
  now: number
  supported?: boolean
  busy?: boolean
  reconnecting?: boolean
  lastError?: string | null
  onConnect?: () => void
  onExploreSimulation?: () => void
  onResume: (id: string) => void
  onNewConfig: () => void
  onStartFromPageSet: (pageSetId: string) => void
  onExport: () => void
  onImport: () => void
  footerLinks?: ReactNode
}

const WRAPPER = [
  'flex-1 overflow-auto',
  'grid grid-cols-[minmax(360px,470px)_minmax(0,1fr)]',
  'max-[1180px]:block',
  '[&>section]:max-[1180px]:[min-height:auto] [&>section]:max-[1180px]:overflow-visible',
  '[&>section:first-child]:max-[1180px]:border-r-0',
  '[&>section:first-child]:max-[1180px]:border-b-2',
].join(' ')

export const WelcomeScreen = ({
  entries,
  now,
  supported = true,
  busy = false,
  reconnecting = false,
  lastError = null,
  onConnect,
  onExploreSimulation,
  onResume,
  onNewConfig,
  onStartFromPageSet,
  onExport,
  onImport,
  footerLinks,
}: WelcomeScreenProps) => (
  <div className={WRAPPER}>
    <ConnectColumn
      supported={supported}
      busy={busy}
      reconnecting={reconnecting}
      lastError={lastError}
      onConnect={onConnect}
      onExploreSimulation={onExploreSimulation}
      footerLinks={footerLinks}
    />
    <BenchPanel
      entries={entries}
      now={now}
      onResume={onResume}
      onNewConfig={onNewConfig}
      onStartFromPageSet={onStartFromPageSet}
      onExport={onExport}
      onImport={onImport}
    />
  </div>
)
