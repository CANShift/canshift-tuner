import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { TogglePill } from '../components/ui/toggle-pill'
import { CanBusSection } from '../components/vehicle/CanBusSection'

const SignalsRoute = lazy(() => import('./SignalsRoute'))

type VehicleSection = 'signals' | 'bus'

const SECTION_LABELS: Record<VehicleSection, string> = {
  signals: 'Signals',
  bus: 'CAN bus',
}

const SECTIONS = Object.keys(SECTION_LABELS) as VehicleSection[]

const SECTION_BODIES: Record<VehicleSection, ReactNode> = {
  signals: <SignalsRoute />,
  bus: <CanBusSection />,
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

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <VehicleNav section={section} onSection={setSection} />
      <Suspense fallback={<RouteLoading />}>{SECTION_BODIES[section]}</Suspense>
    </div>
  )
}

export default VehicleRoute
