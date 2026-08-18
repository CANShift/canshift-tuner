import { lazy, Suspense } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { useDeviceStore } from '../stores/device.store'

const BoardConfigRoute = lazy(() => import('./BoardConfigRoute'))
const ThemesRoute = lazy(() => import('./ThemesRoute'))

const SimulationNote = () => {
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  if (!simulationMode) return null
  return (
    <p className="border-b border-ui-line border-l-[3px] border-l-ui-accent bg-ui-panel px-7 py-3.5 font-mono text-[12.5px] text-ui-ink">
      No board attached — these are the values your config will write, not what a dash reports.
    </p>
  )
}

const DeviceRoute = () => (
  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-ui-bg">
    <SimulationNote />
    <Suspense fallback={<RouteLoading />}>
      <section aria-label="Board" className="flex flex-col border-b-2 border-ui-rule">
        <BoardConfigRoute />
      </section>
      <section aria-label="Theme" className="flex flex-col">
        <ThemesRoute />
      </section>
    </Suspense>
  </div>
)

export default DeviceRoute
