import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import type { UseProfileChange } from '../../hooks/useProfileChange'

interface PendingCarProps {
  profile: UseProfileChange
  onDone: () => void
}

const UseCar = ({ profile, onDone }: PendingCarProps) => (
  <Button
    className="flex-1"
    onClick={() => {
      profile.apply()
      onDone()
    }}
  >
    {STRINGS.car.useThisCar}
  </Button>
)

export const PendingCar = ({
  profile,
  onDone,
}: {
  profile: UseProfileChange
  onDone: () => void
}) => {
  const { change } = profile
  if (change.kind === 'idle' || change.kind === 'applied') return null
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-app-border bg-app-bg p-3.5">
      <p className="text-[15px] leading-snug">{change.message}</p>
      <div className="flex gap-2">
        {change.kind === 'pending' && <UseCar profile={profile} onDone={onDone} />}
        <Button variant="outline" onClick={profile.dismiss}>
          {STRINGS.car.back}
        </Button>
      </div>
    </div>
  )
}
