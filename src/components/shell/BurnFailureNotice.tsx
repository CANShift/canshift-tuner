import { useNavigate } from 'react-router-dom'
import { InlineState } from '@/components/states/InlineState'
import { useDeviceStore } from '../../stores/device.store'
import { useBurnDashboard } from '../../hooks/useBurnDashboard'

export const BurnFailureNotice = () => {
  const lastBurnResult = useDeviceStore((s) => s.lastBurnResult)
  const { canBurn, requestBurn } = useBurnDashboard()
  const navigate = useNavigate()

  if (lastBurnResult === null || lastBurnResult.kind !== 'error') return null

  const { failure } = lastBurnResult
  return (
    <InlineState
      className="shrink-0"
      severity="failure"
      kicker={`${failure.command} · ${failure.code}`}
      title={failure.title}
      body={failure.body}
      primaryAction={{ label: 'RETRY BURN', onClick: requestBurn, disabled: !canBurn }}
      secondaryAction={{
        label: 'Read the error codes',
        onClick: () => {
          navigate('/logs')
        },
      }}
    />
  )
}
