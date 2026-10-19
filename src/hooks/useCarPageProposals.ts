import { useMemo } from 'react'
import { proposeCarPages, signalsToUse, type CarPageProposal } from '../lib/gauges/car-pages'
import { useSignalStore } from '../stores/signal.store'
import { useLiveSignals } from './useLiveSignals'

export interface CarPageProposals {
  proposals: readonly CarPageProposal[]
  usedCount: number
  incoming: boolean
}

const useIncomingNames = (): readonly string[] => {
  const key = Object.keys(useLiveSignals()).sort().join(' ')
  return useMemo(() => (key.length === 0 ? [] : key.split(' ')), [key])
}

export const useCarPageProposals = (): CarPageProposals => {
  const signals = useSignalStore((s) => s.signals)
  const incoming = useIncomingNames()
  return useMemo(() => {
    const used = signalsToUse(signals, incoming)
    return {
      proposals: proposeCarPages(used),
      usedCount: used.length,
      incoming: incoming.length > 0,
    }
  }, [signals, incoming])
}
