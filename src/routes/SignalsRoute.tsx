import { lazy, Suspense, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { SignalsToolbar, type SignalSource } from '../components/signals/SignalsToolbar'
import { SignalsActions } from '../components/signals/SignalsActions'
import { CanSignalTable } from '../components/signals/CanSignalTable'
import { BusScanPanel } from '../components/signals/BusScanPanel'
import { ProfileStrip } from '../components/signals/ProfileStrip'
import { Obd2Pane } from '../components/signals/Obd2Pane'
import { useSignalStore } from '../stores/signal.store'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useSignalUsage } from '../hooks/useSignalUsage'
import { useProfileChange } from '../hooks/useProfileChange'
import { useDisplayUnits } from '../hooks/useDisplayUnits'
import { useVisibleFrames } from '../hooks/useVisibleSignals'
import { useBusScan } from '../hooks/useBusScanPanel'
import { CATALOGUE_INDEX } from '../lib/ecu-catalogue'
import { profileGroups } from '../lib/profile-options'
import { ecuLabelForKey } from '../utils/ecu-label'
import { formatFrameIdHex } from '../utils/frame-id'

const CanBusRoute = lazy(() => import('./CanBusRoute'))

type Pane = SignalSource | 'analysis'

const useProfile = () => {
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const profile = useProfileChange()
  const label = ecuLabelForKey(selectedProfileKey, CATALOGUE_INDEX)
  const groups = useMemo(
    () => profileGroups(CATALOGUE_INDEX.entries, selectedProfileKey, label),
    [selectedProfileKey, label]
  )
  return { key: selectedProfileKey, label, groups, profile }
}

const useRenameFrame = () => {
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  return (from: string, to: string) => {
    for (const signal of signals) {
      if (signal.canFrameId === from) updateSignal(signal.name, { canFrameId: to })
    }
  }
}

const CanPane = ({ filter, hideUnused }: { filter: string; hideUnused: boolean }) => {
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const usage = useSignalUsage()
  const frames = useVisibleFrames(signals, usage, filter, hideUnused)
  const values = useLiveSignals()
  const units = useDisplayUnits()
  const renameFrame = useRenameFrame()
  return (
    <CanSignalTable
      frames={frames}
      values={values}
      usage={usage}
      units={units}
      onPatch={updateSignal}
      onRenameFrame={renameFrame}
    />
  )
}

const ScanResults = () => {
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const { scanner, frames, boundTo } = useBusScan(signals)
  if (frames.length === 0) return null
  return (
    <BusScanPanel
      frames={frames}
      totalFrames={scanner.snapshot.totalFrames}
      signals={signals}
      boundTo={boundTo}
      onAssign={(frameId, signalName) => {
        updateSignal(signalName, { canFrameId: formatFrameIdHex(frameId) })
      }}
      onClear={scanner.reset}
    />
  )
}

interface ViewFilter {
  filter: string
  hideUnused: boolean
}

const PANE_BODIES: Record<Pane, (view: ViewFilter) => ReactNode> = {
  can: (view) => (
    <>
      <ScanResults />
      <CanPane filter={view.filter} hideUnused={view.hideUnused} />
    </>
  ),
  obd2: () => <Obd2Pane />,
  analysis: () => <CanBusRoute />,
}

const useScanToggle = (onScanStart: () => void) => {
  const signals = useSignalStore((s) => s.signals)
  const scan = useBusScan(signals)
  const toggle = () => {
    if (scan.scanning) {
      void scan.scanner.stop()
      return
    }
    onScanStart()
    void scan.scanner.start()
  }
  return { scanning: scan.scanning, canScan: scan.canScan, toggle }
}

interface SignalsActionBarProps {
  pane: Pane
  onPane: (pane: Pane) => void
  profile: ReturnType<typeof useProfile>
}

const SignalsActionBar = ({ pane, onPane, profile }: SignalsActionBarProps) => {
  const signals = useSignalStore((s) => s.signals)
  const scan = useScanToggle(() => onPane('can'))
  const analysing = pane === 'analysis'
  return (
    <SignalsActions
      scanning={scan.scanning}
      canScan={scan.canScan}
      analysing={analysing}
      onToggleScan={scan.toggle}
      onToggleAnalysis={() => onPane(analysing ? 'can' : 'analysis')}
      signals={signals}
      profileLabel={profile.label}
      onImportXml={profile.profile.importXml}
    />
  )
}

const useUsedCount = () => {
  const signals = useSignalStore((s) => s.signals)
  const usage = useSignalUsage()
  return { used: signals.filter((signal) => usage.has(signal.name)).length, total: signals.length }
}

const profileStripProps = (change: ReturnType<typeof useProfileChange>) => ({
  change: change.change,
  onApply: change.apply,
  onDismiss: change.dismiss,
})

const SignalsRoute = () => {
  const profile = useProfile()
  const counts = useUsedCount()
  const [pane, setPane] = useState<Pane>('can')
  const [filter, setFilter] = useState('')
  const [hideUnused, setHideUnused] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <SignalsToolbar
        groups={profile.groups}
        profileKey={profile.key}
        onProfile={profile.profile.selectKey}
        source={pane === 'obd2' ? 'obd2' : 'can'}
        onSource={setPane}
        usedCount={counts.used}
        totalCount={counts.total}
        hideUnused={hideUnused}
        onHideUnused={setHideUnused}
        filter={filter}
        onFilter={setFilter}
        actions={<SignalsActionBar pane={pane} onPane={setPane} profile={profile} />}
      />
      <ProfileStrip {...profileStripProps(profile.profile)} />
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<RouteLoading />}>{PANE_BODIES[pane]({ filter, hideUnused })}</Suspense>
      </div>
    </div>
  )
}

export default SignalsRoute
