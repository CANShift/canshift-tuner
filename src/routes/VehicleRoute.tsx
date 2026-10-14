import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { TogglePill } from '../components/ui/toggle-pill'
import { CanBusPanel } from '../components/vehicle/CanBusPanel'

const SignalsRoute = lazy(() => import('./SignalsRoute'))
const LiveDataRoute = lazy(() => import('./LiveDataRoute'))

type VehicleSection = 'signals' | 'live' | 'bus'

const SECTION_LABELS: Record<VehicleSection, string> = {
  signals: 'Profile & signals',
  live: 'Live values',
  bus: 'CAN bus',
}

const SECTIONS = Object.keys(SECTION_LABELS) as VehicleSection[]

const SECTION_BODIES: Record<VehicleSection, (showSignals: () => void) => ReactNode> = {
  signals: () => <SignalsRoute />,
  live: (showSignals) => <LiveDataRoute onShowSignals={showSignals} />,
  bus: () => <CanBusPanel />,
}

interface VehicleNavProps {
  section: VehicleSection
  onSection: (section: VehicleSection) => void
}

const VehicleNav = ({ section, onSection }: VehicleNavProps) => (
  <nav
    aria-label="Vehicle"
    className="flex shrink-0 flex-wrap gap-2 border-b border-ui-line px-3 py-2 md:px-6"
  >
    {SECTIONS.map((value) => (
      <TogglePill
        key={value}
        tone="neutral"
        active={value === section}
        onClick={() => {
          onSection(value)
        }}
      >
        {SECTION_LABELS[value]}
      </TogglePill>
    ))}
  </nav>
)

const VehicleRoute = () => {
  const [section, setSection] = useState<VehicleSection>('signals')
  const showSignals = () => {
    setSection('signals')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <VehicleNav section={section} onSection={setSection} />
      <Suspense fallback={<RouteLoading />}>{SECTION_BODIES[section](showSignals)}</Suspense>
    </div>
  )
}

export default VehicleRoute
