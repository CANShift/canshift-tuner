import { lazy, Suspense, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { SignalsToolbar, type SignalSource } from '../components/signals/SignalsToolbar'
import { SignalsActions } from '../components/signals/SignalsActions'
import { SignalsWorkspace } from '../components/signals/SignalsWorkspace'
import { ScanResults } from '../components/signals/ScanResults'
import { ProfileStrip } from '../components/signals/ProfileStrip'
import { Obd2Pane } from '../components/signals/Obd2Pane'
import { LiveControls } from '../components/live-data/LiveControls'
import { useSignalStore } from '../stores/signal.store'
import { useSignalUsage } from '../hooks/useSignalUsage'
import { useProfileChange } from '../hooks/useProfileChange'
import { useLiveSession, type LiveSession } from '../hooks/useLiveSession'
import { useScanToggle, type ScanToggle } from '../hooks/useScanToggle'
import { CATALOGUE_INDEX } from '../lib/ecu-catalogue'
import { profileGroups } from '../lib/profile-options'
import { ecuLabelForKey } from '../utils/ecu-label'

const CanBusRoute = lazy(() => import('./CanBusRoute'))

type Pane = SignalSource | 'analysis'

interface PaneContext {
  filter: string
  hideUnused: boolean
  session: LiveSession
  scan: ScanToggle
}

const PANE_BODIES: Record<Pane, (context: PaneContext) => ReactNode> = {
  can: ({ filter, hideUnused, session, scan }) => (
    <>
      <ScanResults />
      <SignalsWorkspace
        session={session}
        filter={filter}
        hideUnused={hideUnused}
        onCaptureBus={scan.toggle}
      />
    </>
  ),
  obd2: () => <Obd2Pane />,
  analysis: () => <CanBusRoute />,
}

const useProfile = () => {
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const change = useProfileChange()
  const label = ecuLabelForKey(selectedProfileKey, CATALOGUE_INDEX)
  const groups = useMemo(
    () => profileGroups(CATALOGUE_INDEX.entries, selectedProfileKey, label),
    [selectedProfileKey, label]
  )
  return { key: selectedProfileKey, label, groups, change }
}

type Profile = ReturnType<typeof useProfile>

const useUsedCount = () => {
  const signals = useSignalStore((s) => s.signals)
  const usage = useSignalUsage()
  return { used: signals.filter((signal) => usage.has(signal.name)).length, total: signals.length }
}

interface ActionBarProps {
  pane: Pane
  onPane: (pane: Pane) => void
  profile: Profile
  scan: ScanToggle
  session: LiveSession
}

const ActionBar = ({ pane, onPane, profile, scan, session }: ActionBarProps) => {
  const signals = useSignalStore((s) => s.signals)
  const analysing = pane === 'analysis'
  return (
    <>
      <SignalsActions
        scanning={scan.scanning}
        canScan={scan.canScan}
        analysing={analysing}
        onToggleScan={scan.toggle}
        onToggleAnalysis={() => onPane(analysing ? 'can' : 'analysis')}
        signals={signals}
        profileLabel={profile.label}
        onImportXml={profile.change.importXml}
      />
      {pane === 'can' && <LiveControls session={session} />}
    </>
  )
}

const useViewFilter = () => {
  const [filter, setFilter] = useState('')
  const [hideUnused, setHideUnused] = useState(false)
  return { filter, setFilter, hideUnused, setHideUnused }
}

const profileStripProps = ({ change }: Profile) => ({
  change: change.change,
  onApply: change.apply,
  onDismiss: change.dismiss,
})

type ViewFilter = ReturnType<typeof useViewFilter>

interface SignalsHeaderProps extends ActionBarProps {
  view: ViewFilter
}

const SignalsHeader = ({ view, ...bar }: SignalsHeaderProps) => {
  const counts = useUsedCount()
  return (
    <SignalsToolbar
      groups={bar.profile.groups}
      profileKey={bar.profile.key}
      onProfile={bar.profile.change.selectKey}
      source={bar.pane === 'obd2' ? 'obd2' : 'can'}
      onSource={bar.onPane}
      usedCount={counts.used}
      totalCount={counts.total}
      hideUnused={view.hideUnused}
      onHideUnused={view.setHideUnused}
      filter={view.filter}
      onFilter={view.setFilter}
      actions={<ActionBar {...bar} />}
    />
  )
}

const SignalsRoute = () => {
  const signals = useSignalStore((s) => s.signals)
  const profile = useProfile()
  const session = useLiveSession(signals)
  const [pane, setPane] = useState<Pane>('can')
  const scan = useScanToggle(() => setPane('can'))
  const view = useViewFilter()
  const context = { filter: view.filter, hideUnused: view.hideUnused, session, scan }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <SignalsHeader
        view={view}
        pane={pane}
        onPane={setPane}
        profile={profile}
        scan={scan}
        session={session}
      />
      <ProfileStrip {...profileStripProps(profile)} />
      <Suspense fallback={<RouteLoading />}>{PANE_BODIES[pane](context)}</Suspense>
    </div>
  )
}

export default SignalsRoute
