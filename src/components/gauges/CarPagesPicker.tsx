import { useState } from 'react'
import { FIRMWARE_CAPS } from '@canshift/core'
import type { CarPageProposal } from '../../lib/gauges/car-pages'
import { pageFromLayout } from '../../lib/gauges/layouts'
import { useCarPageProposals } from '../../hooks/useCarPageProposals'
import { useDashboardStore } from '../../stores/dashboard.store'
import { CarPagesPanel } from './CarPagesPanel'

export interface CarPagesPickerProps {
  onBack: () => void
  onAdded: () => void
}

const addProposals = (proposals: readonly CarPageProposal[]): void => {
  proposals.forEach((proposal) => {
    const taken = new Set(useDashboardStore.getState().config?.pages.map((page) => page.id) ?? [])
    useDashboardStore.getState().addPage(pageFromLayout(proposal, taken))
  })
}

const useRoom = (): number =>
  useDashboardStore((s) => FIRMWARE_CAPS.MAX_PAGES - (s.config?.pages.length ?? 0))

const usePicked = () => {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set())
  const toggle = (id: string, checked: boolean) => {
    setPicked((previous) => {
      const next = new Set(previous)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }
  return { picked, toggle }
}

export const CarPagesPicker = ({ onBack, onAdded }: CarPagesPickerProps) => {
  const found = useCarPageProposals()
  const topBar = useDashboardStore((s) => s.config?.topBar)
  const room = useRoom()
  const { picked, toggle } = usePicked()
  const add = () => {
    addProposals(found.proposals.filter((proposal) => picked.has(proposal.id)))
    onAdded()
  }
  return (
    <CarPagesPanel {...{ found, topBar, room, picked, onBack }} onToggle={toggle} onAdd={add} />
  )
}
