import { lazy, Suspense } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'

const BoardConfigRoute = lazy(() => import('./BoardConfigRoute'))
const ThemesRoute = lazy(() => import('./ThemesRoute'))

const DeviceRoute = () => (
  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-ui-bg">
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
