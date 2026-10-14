import { lazy, Suspense, useState } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { ConfigBackupPanel } from '../components/device/ConfigBackupPanel'
import { DeviceFactsBand } from '../components/device/DeviceFactsBand'
import { DeviceSection } from '../components/device/DeviceSection'
import { DeviceSettingsSection } from '../components/device/DeviceSettingsSection'
import { BoardProfileSection } from '../components/device/BoardProfileSection'
import { useDeviceStore } from '../stores/device.store'

const BoardConfigRoute = lazy(() => import('./BoardConfigRoute'))

const GRID =
  'grid gap-x-14 gap-y-10 px-4 pb-11 pt-[30px] sm:px-7 min-[1100px]:[grid-template-columns:minmax(380px,460px)_minmax(0,1fr)]'

const SimulationNotice = () => {
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  if (!simulationMode) return null
  return (
    <p className="border-b border-l-[3px] border-ui-line border-l-ui-accent bg-ui-panel px-4 py-3.5 font-mono text-[12.5px] text-ui-ink sm:px-7">
      No board attached — these are the values your config will write, not what a dash reports.
    </p>
  )
}

const BoardDefinition = () => (
  <div className="min-[1100px]:col-span-2">
    <DeviceSection title="BOARD DEFINITION">
      <div className="pt-4">
        <Suspense fallback={<RouteLoading />}>
          <BoardConfigRoute />
        </Suspense>
      </div>
    </DeviceSection>
  </div>
)

const DeviceRoute = () => {
  const [definitionOpen, setDefinitionOpen] = useState(false)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-ui-bg">
      <SimulationNotice />
      <DeviceFactsBand />
      <div className={GRID}>
        <DeviceSettingsSection />
        <div className="flex min-w-0 flex-col gap-10">
          <BoardProfileSection
            definitionOpen={definitionOpen}
            onToggleDefinition={() => {
              setDefinitionOpen((open) => !open)
            }}
          />
          <ConfigBackupPanel />
        </div>
        {definitionOpen && <BoardDefinition />}
      </div>
    </div>
  )
}

export default DeviceRoute
