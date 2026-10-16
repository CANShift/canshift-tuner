import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { STRINGS } from '../../strings'
import { RouteLoading } from '../shell/RouteLoading'
import { UiIcon } from '../icons/UiIcons'

const CanBusRoute = lazy(() => import('../../routes/CanBusRoute'))

const RawFramesView = () => (
  <div className="flex min-h-0 flex-1 flex-col">
    <Link
      to="/car"
      className="flex h-12 shrink-0 items-center gap-2 border-b border-app-border px-4 text-[15px] text-app-text no-underline"
    >
      <UiIcon name="chevronLeft" />
      {STRINGS.car.yourCar}
    </Link>
    <Suspense fallback={<RouteLoading />}>
      <CanBusRoute />
    </Suspense>
  </div>
)

export default RawFramesView
