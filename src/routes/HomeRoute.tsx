import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import WelcomeRoute from './WelcomeRoute'
import { RouteLoading } from '../components/shell/RouteLoading'

const FirmwareRoute = lazy(() => import('./FirmwareRoute'))
const ContactRoute = lazy(() => import('./ContactRoute'))

interface HomePane {
  path: string
  label: string
  element: ReactNode
}

const WELCOME_PANE: HomePane = { path: '/', label: 'Welcome', element: <WelcomeRoute /> }

const HOME_PANES: readonly HomePane[] = [
  WELCOME_PANE,
  { path: '/flash', label: 'Flash', element: <FirmwareRoute /> },
  { path: '/contact', label: 'Contact', element: <ContactRoute /> },
]

const HomeRoute = () => {
  const location = useLocation()
  const active = HOME_PANES.find((pane) => pane.path === location.pathname) ?? WELCOME_PANE
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[208px_minmax(0,1fr)]">
      <nav aria-label="Home" className="border-r-2 border-ui-rule pt-5">
        {HOME_PANES.map((pane) => (
          <Link
            key={pane.path}
            to={pane.path}
            className={cn(paneTab({ active: pane.path === active.path }))}
          >
            {pane.label}
          </Link>
        ))}
      </nav>
      <div className="flex min-h-0 flex-col overflow-y-auto">
        <Suspense fallback={<RouteLoading />}>{active.element}</Suspense>
      </div>
    </div>
  )
}

const paneTab = cva(
  'block w-full px-5 py-[13px] text-left text-[14px] font-bold no-underline text-ui-ink',
  {
    variants: {
      active: {
        true: 'bg-ui-rule text-ui-bg',
        false: 'hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)

export default HomeRoute
