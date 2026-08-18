import { lazy, Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { RouteLoading } from '../components/shell/RouteLoading'

const CanBusRoute = lazy(() => import('./CanBusRoute'))
const EcuRoute = lazy(() => import('./EcuRoute'))
const Obd2Route = lazy(() => import('./Obd2Route'))

type SignalSource = 'can' | 'ecu' | 'obd2'

const SOURCE_LABELS: Record<SignalSource, string> = {
  can: 'CAN',
  ecu: 'ECU PROFILE',
  obd2: 'OBD-II',
}

const SOURCE_PANES: Record<SignalSource, ReactNode> = {
  can: <CanBusRoute />,
  ecu: <EcuRoute />,
  obd2: <Obd2Route />,
}

const SOURCES = Object.keys(SOURCE_LABELS) as readonly SignalSource[]

const SignalsRoute = () => {
  const [source, setSource] = useState<SignalSource>('can')
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <div className="flex h-[54px] shrink-0 items-center gap-4 border-b-2 border-ui-rule px-6">
        <div className="flex gap-px">
          {SOURCES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSource(value)
              }}
              className={cn(segment({ active: value === source }))}
            >
              {SOURCE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<RouteLoading />}>{SOURCE_PANES[source]}</Suspense>
      </div>
    </div>
  )
}

const segment = cva(
  [
    'cursor-pointer whitespace-nowrap border border-ui-ink px-[18px] py-[9px]',
    'text-[12.5px] font-bold tracking-[0.06em]',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'bg-ui-rule text-ui-bg',
        false: 'bg-transparent text-ui-ink hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)

export default SignalsRoute
