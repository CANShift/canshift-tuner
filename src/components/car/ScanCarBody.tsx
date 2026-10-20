import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useDeviceStore } from '../../stores/device.store'
import { useCarScanStore, type CarScanPhase } from '../../stores/car-scan/car-scan.store'
import { transportErrorText } from '../../transport/humanize-transport-error'
import { ScanCarProgress } from './ScanCarProgress'
import { ScanCarResult } from './ScanCarResult'

export interface ScanCarBodyProps {
  onReview: (key: string) => void
}

const S = STRINGS.carScan

interface StartButtonProps {
  label: string
  variant?: 'default' | 'outline'
}

const StartButton = ({ label, variant = 'default' }: StartButtonProps) => {
  const start = useCarScanStore((s) => s.start)
  const connected = useDeviceStore((s) => s.connected && !s.simulationMode)
  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" variant={variant} disabled={!connected} onClick={() => void start()}>
        {label}
      </Button>
      {!connected && <span className="text-xs text-app-muted">{S.connectFirst}</span>}
    </div>
  )
}

const Intro = () => (
  <div className="flex flex-col gap-4">
    <p className="text-pretty text-sm leading-snug text-app-secondary">{S.intro}</p>
    <StartButton label={S.start} />
  </div>
)

const Failure = () => {
  const error = useCarScanStore((s) => s.error)
  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="text-sm leading-snug text-app-accent">
        {transportErrorText(error)}
      </p>
      <StartButton label={S.again} />
    </div>
  )
}

const Done = ({ onReview }: ScanCarBodyProps) => (
  <div className="flex flex-col gap-4">
    <ScanCarResult onReview={onReview} />
    <StartButton label={S.again} variant="outline" />
  </div>
)

const PHASE_VIEWS: Record<CarScanPhase, ComponentType<ScanCarBodyProps>> = {
  idle: Intro,
  starting: ScanCarProgress,
  scanning: ScanCarProgress,
  matching: ScanCarProgress,
  done: Done,
  error: Failure,
}

export const ScanCarBody = ({ onReview }: ScanCarBodyProps) => {
  const phase = useCarScanStore((s) => s.phase)
  const View = PHASE_VIEWS[phase]
  return <View onReview={onReview} />
}
