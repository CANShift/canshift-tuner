import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { RouteLoading } from '../components/shell/RouteLoading'
import { TogglePill } from '../components/ui/toggle-pill'

const SignalsRoute = lazy(() => import('./SignalsRoute'))
const LiveDataRoute = lazy(() => import('./LiveDataRoute'))

type VehicleSection = 'signals' | 'live'

const SECTION_LABELS: Record<VehicleSection, string> = {
  signals: 'Profile & signals',
  live: 'Live values',
}

const SECTIONS = Object.keys(SECTION_LABELS) as VehicleSection[]

const VehicleRoute = () => {
  const [section, setSection] = useState<VehicleSection>('signals')

  const bodies: Record<VehicleSection, ReactNode> = {
    signals: <SignalsRoute />,
    live: (
      <LiveDataRoute
        onShowSignals={() => {
          setSection('signals')
        }}
      />
    ),
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <nav aria-label="Vehicle" className="flex shrink-0 gap-2 border-b border-ui-line px-6 py-2">
        {SECTIONS.map((value) => (
          <TogglePill
            key={value}
            tone="neutral"
            active={value === section}
            onClick={() => {
              setSection(value)
            }}
          >
            {SECTION_LABELS[value]}
          </TogglePill>
        ))}
      </nav>
      <Suspense fallback={<RouteLoading />}>{bodies[section]}</Suspense>
    </div>
  )
}

export default VehicleRoute
