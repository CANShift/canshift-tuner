import type { TopBarConfig } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import type { CarPageProposal } from '../../lib/gauges/car-pages'
import type { CarPageProposals } from '../../hooks/useCarPageProposals'
import { CarPageCard } from './CarPageCard'

export interface CarPagesPanelProps {
  found: CarPageProposals
  topBar: TopBarConfig | undefined
  room: number
  picked: ReadonlySet<string>
  onToggle: (id: string, checked: boolean) => void
  onBack: () => void
  onAdd: () => void
}

const G = STRINGS.gauges

const sourceLine = ({ usedCount, incoming }: CarPageProposals): string =>
  incoming ? G.fromIncoming(usedCount) : G.fromDefined(usedCount)

const addLabel = (count: number): string => (count === 0 ? G.pickPages : G.addPages(count))

const RoomNote = ({ room, offered }: { room: number; offered: number }) => {
  if (room >= offered) return null
  return <p className="m-0 text-[13px] text-app-muted">{G.roomFor(room)}</p>
}

interface ProposalListProps extends Pick<CarPagesPanelProps, 'picked' | 'room' | 'onToggle'> {
  proposals: readonly CarPageProposal[]
  topBar: TopBarConfig
}

const ProposalList = ({ proposals, topBar, picked, room, onToggle }: ProposalListProps) => (
  <ul className="flex flex-col gap-3">
    {proposals.map((proposal) => (
      <CarPageCard
        key={proposal.id}
        proposal={proposal}
        topBar={topBar}
        checked={picked.has(proposal.id)}
        disabled={!picked.has(proposal.id) && picked.size >= room}
        onToggle={(checked) => {
          onToggle(proposal.id, checked)
        }}
      />
    ))}
  </ul>
)

const PanelBody = ({ found, topBar, picked, room, onToggle }: CarPagesPanelProps) => {
  if (found.proposals.length === 0 || topBar === undefined)
    return <p className="m-0 text-[15px] text-app-secondary">{G.notEnoughSignals}</p>
  return (
    <>
      <RoomNote room={room} offered={found.proposals.length} />
      <ProposalList {...{ topBar, picked, room, onToggle }} proposals={found.proposals} />
    </>
  )
}

const PanelActions = ({ picked, onBack, onAdd }: CarPagesPanelProps) => (
  <div className="sticky -bottom-7 -mx-4 -mb-7 flex gap-2 border-t border-app-divider bg-app-surface px-4 pb-7 pt-3 lg:-bottom-5 lg:-mx-5 lg:-mb-5 lg:px-5 lg:pb-5">
    <Button variant="secondary" onClick={onBack}>
      {G.back}
    </Button>
    <Button className="flex-1" disabled={picked.size === 0} onClick={onAdd}>
      {addLabel(picked.size)}
    </Button>
  </div>
)

export const CarPagesPanel = (props: CarPagesPanelProps) => (
  <>
    <SheetTitle className="text-[21px] font-bold lg:text-lg">{G.buildFromCar}</SheetTitle>
    <SheetDescription className="text-sm text-app-muted">
      {sourceLine(props.found)}
    </SheetDescription>
    <PanelBody {...props} />
    <p className="m-0 text-xs text-app-muted">{STRINGS.firstOpen.hint}</p>
    <PanelActions {...props} />
  </>
)
