import { NoEcuProfileState } from '@/components/states/NoEcuProfileState'

export interface LiveDataEmptyProps {
  hasProfile: boolean
  onPickProfile: () => void
  onCaptureBus: () => void
}

const FILTER_EMPTY = 'px-6 py-16 text-center text-[13px] text-brand-neutral-500'

const STATE_PLACEMENT = 'mx-7 my-[26px] max-w-[560px]'

export const LiveDataEmpty = ({ hasProfile, onPickProfile, onCaptureBus }: LiveDataEmptyProps) => {
  if (hasProfile) return <div className={FILTER_EMPTY}>No signals match the current filter.</div>
  return (
    <NoEcuProfileState
      className={STATE_PLACEMENT}
      onPickProfile={onPickProfile}
      onCaptureBus={onCaptureBus}
    />
  )
}
