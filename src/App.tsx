import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteLoading } from './components/shell/RouteLoading'
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
import { useAutoReconnect } from './hooks/useAutoReconnect'
import { useSimulationBootstrap } from './hooks/useSimulationBootstrap'
import { useDashSync } from './hooks/useDashSync'
import { useVersionHandshake } from './hooks/useVersionHandshake'
import { useHeartbeat } from './hooks/useHeartbeat'
import { useFirmwareLogBridge } from './hooks/useFirmwareLogBridge'
import { useWidgetOverflowWarnings } from './hooks/useWidgetOverflowWarnings'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { RAW_FRAMES_PATH } from './components/car/RawFramesLink'
import { FIRMWARE_PATH, SESSION_LOGS_PATH } from './components/dash/AboutCard'
import { FirmwareOverlay } from './components/firmware/FirmwareOverlay'
import { HOME_PATH, LEGACY_REDIRECTS, ROUTE_PATHS, type RoutePath } from './constants/routes'

const GaugesSection = lazy(() => import('./components/gauges/GaugesSection'))
const CarSection = lazy(() => import('./components/car/CarSection'))
const RawFramesView = lazy(() => import('./components/car/RawFramesView'))
const DashSection = lazy(() => import('./components/dash/DashSection'))
const FirmwareScreen = lazy(() => import('./components/firmware/FirmwareScreen'))
const SessionLogsScreen = lazy(() => import('./components/session-logs/SessionLogsScreen'))

const ROUTE_ELEMENTS: Record<RoutePath, ReactNode> = {
  '/gauges': (
    <ErrorBoundary scope="editor">
      <GaugesSection />
    </ErrorBoundary>
  ),
  '/car': <CarSection />,
  '/dash': <DashSection />,
}

const LEGACY_PATHS = Object.keys(LEGACY_REDIRECTS)

const useDeviceSession = (): void => {
  useAutoReconnect()
  useSimulationBootstrap()
  useVersionHandshake()
  useHeartbeat()
  useFirmwareLogBridge()
  useDashSync()
}

const useEditorSession = (): void => {
  useWidgetOverflowWarnings()
  useDocumentMeta()
}

const AppRoutes = () => (
  <Routes>
    {ROUTE_PATHS.map((path) => (
      <Route key={path} path={path} element={ROUTE_ELEMENTS[path]} />
    ))}
    <Route path={RAW_FRAMES_PATH} element={<RawFramesView />} />
    <Route path={FIRMWARE_PATH} element={<FirmwareScreen />} />
    <Route path={SESSION_LOGS_PATH} element={<SessionLogsScreen />} />
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
      <SendBar />
      <TabBar />
      <NotSentSheet />
      <Toaster />
      <FirmwareOverlay />
    </div>
  )
}

export default App
