import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/shell/Header'
import Sidebar from './components/shell/Sidebar'
import FeedbackButton from './components/shell/FeedbackButton'
import { DeviceAlertBar } from './components/shell/DeviceAlertBar'
import WelcomeRoute from './routes/WelcomeRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useConnectionStore } from './stores/connection.store'
import { useDashboardStore } from './stores/dashboard.store'
import { useDeviceStore } from './stores/device.store'
import { useAutoReconnect } from './hooks/useAutoReconnect'
import { useSimulationBootstrap } from './hooks/useSimulationBootstrap'
import { useDeviceConfigBootstrap } from './hooks/useDeviceConfigBootstrap'
import { useVersionHandshake } from './hooks/useVersionHandshake'
import { useHeartbeat } from './hooks/useHeartbeat'
import { useHeapStatsSubscription } from './hooks/useHeapStatsSubscription'
import { useFirmwareLogBridge } from './hooks/useFirmwareLogBridge'
import { useBurnShortcut } from './hooks/useBurnShortcut'
import { bootstrapProjects } from './stores/project/project.store'
import { useWidgetOverflowWarnings } from './hooks/useWidgetOverflowWarnings'
import { useUnsavedChangesGuard } from './hooks/useUnsavedChangesGuard'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { DeviceConfigConflictNotice } from './components/shell/DeviceConfigConflictNotice'
import { BurnFailureNotice } from './components/shell/BurnFailureNotice'
import { ROUTE_PATHS, type RoutePath } from './constants/routes'

const EditorRoute = lazy(() => import('./routes/EditorRoute'))
const AboutRoute = lazy(() => import('./routes/AboutRoute'))
const CanBusRoute = lazy(() => import('./routes/CanBusRoute'))
const CliRoute = lazy(() => import('./routes/CliRoute'))
const EcuRoute = lazy(() => import('./routes/EcuRoute'))
const FirmwareRoute = lazy(() => import('./routes/FirmwareRoute'))
const BoardConfigRoute = lazy(() => import('./routes/BoardConfigRoute'))
const LiveDataRoute = lazy(() => import('./routes/LiveDataRoute'))
const LogsRoute = lazy(() => import('./routes/LogsRoute'))
const Obd2Route = lazy(() => import('./routes/Obd2Route'))
const ThemesRoute = lazy(() => import('./routes/ThemesRoute'))

const RouteLoading = () => {
  return (
    <div className="flex flex-1 items-center justify-center text-[12px] text-text-dim">
      Loading…
    </div>
  )
}

const ROUTE_ELEMENTS: Record<RoutePath, ReactNode> = {
  '/': <WelcomeRoute />,
  '/dashboard': (
    <ErrorBoundary scope="editor">
      <EditorRoute />
    </ErrorBoundary>
  ),
  '/can': <CanBusRoute />,
  '/ecu': <EcuRoute />,
  '/obd2': <Obd2Route />,
  '/themes': <ThemesRoute />,
  '/live': <LiveDataRoute />,
  '/logs': <LogsRoute />,
  '/cli': <CliRoute />,
  '/board': <BoardConfigRoute />,
  '/firmware': <FirmwareRoute />,
  '/about': <AboutRoute />,
}

const DISCONNECTED_ALLOWED_PATHS = new Set([
  '/',
  '/board',
  '/firmware',
  '/about',
  '/logs',
  '/themes',
])

const DisconnectedGuard = ({ children }: { children: ReactNode }) => {
  const status = useConnectionStore((s) => s.status)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const location = useLocation()
  if (
    status !== 'connected' &&
    status !== 'reconnecting' &&
    !simulationMode &&
    !DISCONNECTED_ALLOWED_PATHS.has(location.pathname)
  ) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

const App = () => {
  useAutoReconnect()
  useSimulationBootstrap()
  useVersionHandshake()
  useHeartbeat()
  useHeapStatsSubscription()
  useFirmwareLogBridge()
  useDeviceConfigBootstrap()
  useBurnShortcut()
  useWidgetOverflowWarnings()
  useUnsavedChangesGuard()
  useDocumentMeta()

  const hasDashboardConfig = useDashboardStore((s) => s.config !== null)
  useEffect(() => {
    bootstrapProjects()
  }, [hasDashboardConfig])

  return (
    <div className={SHELL}>
      <Header />
      <DeviceAlertBar />
      <DeviceConfigConflictNotice />
      <BurnFailureNotice />
      <div className={BODY}>
        <Sidebar />
        <main className={MAIN}>
          <DisconnectedGuard>
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                {ROUTE_PATHS.map((path) => (
                  <Route key={path} path={path} element={ROUTE_ELEMENTS[path]} />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </DisconnectedGuard>
        </main>
      </div>
      <FeedbackButton />
    </div>
  )
}

const SHELL = 'flex h-screen flex-col bg-brand-chrome-bg font-sans text-brand-text'

const BODY = 'flex flex-1 overflow-hidden'

const MAIN = 'flex flex-1 flex-col overflow-hidden'

export default App
