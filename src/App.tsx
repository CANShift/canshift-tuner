import { lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/shell/Header'
import { Footer } from './components/shell/Footer'
import { RouteLoading } from './components/shell/RouteLoading'
import { DeviceAlertBar } from './components/shell/DeviceAlertBar'
import { SimulationStrip } from './components/shell/SimulationStrip'
import HomeRoute from './routes/HomeRoute'
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
import { useSaveShortcut } from './hooks/useSaveShortcut'
import { bootstrapProjects } from './stores/project/project.store'
import { useWidgetOverflowWarnings } from './hooks/useWidgetOverflowWarnings'
import { useUnsavedChangesGuard } from './hooks/useUnsavedChangesGuard'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { DeviceConfigConflictNotice } from './components/shell/DeviceConfigConflictNotice'
import { CliPanel } from './components/cli/CliPanel'
import { useUiStore } from './stores/ui.store'
import {
  DEVICE_GATED_PATHS,
  LEGACY_REDIRECTS,
  ROUTE_PATHS,
  type RoutePath,
} from './constants/routes'

const EditorRoute = lazy(() => import('./routes/EditorRoute'))
const SignalsRoute = lazy(() => import('./routes/SignalsRoute'))
const LiveDataRoute = lazy(() => import('./routes/LiveDataRoute'))
const DeviceRoute = lazy(() => import('./routes/DeviceRoute'))

const ROUTE_ELEMENTS: Record<RoutePath, ReactNode> = {
  '/': <HomeRoute />,
  '/flash': <HomeRoute />,
  '/contact': <HomeRoute />,
  '/dash': (
    <ErrorBoundary scope="editor">
      <EditorRoute />
    </ErrorBoundary>
  ),
  '/signals': <SignalsRoute />,
  '/live': <LiveDataRoute />,
  '/device': <DeviceRoute />,
}

const LEGACY_PATHS = Object.keys(LEGACY_REDIRECTS)

const useSettledAfterMount = (): boolean => {
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    setSettled(true)
  }, [])
  return settled
}

const DeviceGate = ({ children }: { children: ReactNode }) => {
  const status = useConnectionStore((s) => s.status)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const location = useLocation()
  const settled = useSettledAfterMount()
  const live = status === 'connected' || status === 'reconnecting'
  const gated = DEVICE_GATED_PATHS.has(location.pathname as RoutePath)
  if (settled && !live && !simulationMode && gated) {
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
  useSaveShortcut()
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
      <SimulationStrip />
      <DeviceAlertBar />
      <DeviceConfigConflictNotice />
      <main className={MAIN}>
        <DeviceGate>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {ROUTE_PATHS.map((path) => (
                <Route key={path} path={path} element={ROUTE_ELEMENTS[path]} />
              ))}
              {LEGACY_PATHS.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={<Navigate to={LEGACY_REDIRECTS[path] ?? '/'} replace />}
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </DeviceGate>
      </main>
      <DashCli />
      <Footer />
    </div>
  )
}

const DashCli = () => {
  const cliOpen = useUiStore((s) => s.cliOpen)
  const location = useLocation()
  if (!cliOpen || location.pathname !== '/dash') return null
  return <CliPanel />
}

const SHELL = 'flex h-screen min-w-[900px] flex-col bg-ui-bg font-sans text-ui-ink'

const MAIN = 'flex min-h-0 flex-1 flex-col overflow-hidden'

export default App
