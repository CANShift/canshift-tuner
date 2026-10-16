import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/shell/Footer'
import { RouteLoading } from './components/shell/RouteLoading'
import { DeviceAlertBar } from './components/shell/DeviceAlertBar'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppHeader } from './components/chrome/AppHeader'
import { ConnectionGate } from './components/chrome/ConnectionGate'
import { NotSentSheet } from './components/chrome/NotSentSheet'
import { ReconnectBanner } from './components/chrome/ReconnectBanner'
import { SectionRail } from './components/chrome/SectionRail'
import { SendBar } from './components/chrome/SendBar'
import { SendNotice } from './components/chrome/SendNotice'
import { TabBar } from './components/chrome/TabBar'
import { Toaster } from './components/chrome/Toaster'
import { useDashboardStore } from './stores/dashboard.store'
import { useAutoReconnect } from './hooks/useAutoReconnect'
import { useSimulationBootstrap } from './hooks/useSimulationBootstrap'
import { useDashSync } from './hooks/useDashSync'
import { useVersionHandshake } from './hooks/useVersionHandshake'
import { useHeartbeat } from './hooks/useHeartbeat'
import { useHeapStatsSubscription } from './hooks/useHeapStatsSubscription'
import { useFirmwareLogBridge } from './hooks/useFirmwareLogBridge'
import { useSaveShortcut } from './hooks/useSaveShortcut'
import { bootstrapProjects } from './stores/project/project.store'
import { useWidgetOverflowWarnings } from './hooks/useWidgetOverflowWarnings'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { CliPanel } from './components/cli/CliPanel'
import { useUiStore } from './stores/ui.store'
import { HOME_PATH, LEGACY_REDIRECTS, ROUTE_PATHS, type RoutePath } from './constants/routes'

const GaugesSection = lazy(() => import('./components/gauges/GaugesSection'))
const VehicleRoute = lazy(() => import('./routes/VehicleRoute'))
const DeviceRoute = lazy(() => import('./routes/DeviceRoute'))

const GAUGES_PATH: RoutePath = '/gauges'

const ROUTE_ELEMENTS: Record<RoutePath, ReactNode> = {
  '/gauges': (
    <ErrorBoundary scope="editor">
      <GaugesSection />
    </ErrorBoundary>
  ),
  '/car': <VehicleRoute />,
  '/dash': <DeviceRoute />,
}

const LEGACY_PATHS = Object.keys(LEGACY_REDIRECTS)

const useDeviceSession = (): void => {
  useAutoReconnect()
  useSimulationBootstrap()
  useVersionHandshake()
  useHeartbeat()
  useHeapStatsSubscription()
  useFirmwareLogBridge()
  useDashSync()
}

const useEditorSession = (): void => {
  useSaveShortcut()
  useWidgetOverflowWarnings()
  useDocumentMeta()
  const hasDashboardConfig = useDashboardStore((s) => s.config !== null)
  useEffect(() => {
    bootstrapProjects()
  }, [hasDashboardConfig])
}

const AppRoutes = () => (
  <Routes>
    {ROUTE_PATHS.map((path) => (
      <Route key={path} path={path} element={ROUTE_ELEMENTS[path]} />
    ))}
    {LEGACY_PATHS.map((path) => (
      <Route
        key={path}
        path={path}
        element={<Navigate to={LEGACY_REDIRECTS[path] ?? HOME_PATH} replace />}
      />
    ))}
    <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
  </Routes>
)

const SectionContent = () => (
  <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
    <SendNotice />
    <DeviceAlertBar />
    <ConnectionGate>
      <Suspense fallback={<RouteLoading />}>
        <AppRoutes />
      </Suspense>
    </ConnectionGate>
  </main>
)

const App = () => {
  useDeviceSession()
  useEditorSession()

  return (
    <div className="flex h-dvh flex-col bg-app-bg font-ui text-app-text">
      <AppHeader />
      <ReconnectBanner />
      <div className="flex min-h-0 flex-1">
        <SectionRail />
        <SectionContent />
      </div>
      <DashCli />
      <Footer />
      <SendBar />
      <TabBar />
      <NotSentSheet />
      <Toaster />
    </div>
  )
}

const DashCli = () => {
  const cliOpen = useUiStore((s) => s.cliOpen)
  const location = useLocation()
  if (!cliOpen || location.pathname !== GAUGES_PATH) return null
  return <CliPanel />
}

export default App
