import { InlineState } from '@/components/states/InlineState'
import { CATALOGUE_INDEX } from '@/lib/ecu-catalogue'

export interface NoEcuProfileStateProps {
  onPickProfile: () => void
  onCaptureBus: () => void
  className?: string | undefined
}

const BODY = `Widgets need a profile before they can read anything. Pick one of the ${String(CATALOGUE_INDEX.entries.length)} shipped profiles, or derive one from a bus capture.`

export const NoEcuProfileState = ({
  onPickProfile,
  onCaptureBus,
  className,
}: NoEcuProfileStateProps) => (
  <InlineState
    className={className}
    severity="empty"
    title="No signals to bind yet"
    body={BODY}
    primaryAction={{ label: 'PICK A PROFILE', onClick: onPickProfile }}
    secondaryAction={{ label: 'Capture the bus', onClick: onCaptureBus }}
  />
)
