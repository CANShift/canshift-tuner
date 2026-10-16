import { CATALOGUE_INDEX } from '../lib/ecu-catalogue'
import { useSignalStore } from '../stores/signal.store'
import { ecuLabelForKey } from '../utils/ecu-label'

export const useCarLabel = (): string => {
  const key = useSignalStore((s) => s.selectedProfileKey)
  return ecuLabelForKey(key, CATALOGUE_INDEX)
}
