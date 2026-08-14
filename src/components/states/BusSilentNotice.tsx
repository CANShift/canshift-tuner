import { InlineState } from '@/components/states/InlineState'
import { useBusSilence } from '../../hooks/useBusSilence'

const TITLE = 'The dash is connected, the bus is not'
const BODY =
  'Editing works and Live data stays empty. Check the bus rate and the 120 Ω termination.'

export const BusSilentNotice = () => {
  const { silent, elapsedSeconds } = useBusSilence()

  if (!silent) return null

  return (
    <InlineState
      className="shrink-0"
      severity="warning"
      kicker={`CAN · 0 FRAMES IN ${String(elapsedSeconds)} s`}
      title={TITLE}
      body={BODY}
    />
  )
}
