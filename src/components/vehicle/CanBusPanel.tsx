import { CanBusSection } from './CanBusSection'
import { useCanSpeed } from '../../hooks/useCanSpeed'

export const CanBusPanel = () => {
  const { state, writeSpeed } = useCanSpeed()
  return <CanBusSection state={state} onWrite={writeSpeed} />
}
