import { provisionMessage, useProvisionBoardProfile } from '../../hooks/useProvisionBoardProfile'
import { BoardProfileRow } from './BoardProfileRow'
import { DeviceSection } from './DeviceSection'

const provisionBlockedNote = (hasBoard: boolean, linked: boolean): string => {
  if (!hasBoard) return 'No board picked — choose one in the board definition below.'
  if (!linked) return 'Connect the dash to write its board profile.'
  return ''
}

export interface BoardProfileSectionProps {
  definitionOpen: boolean
  onToggleDefinition: () => void
}

export const BoardProfileSection = ({
  definitionOpen,
  onToggleDefinition,
}: BoardProfileSectionProps) => {
  const provision = useProvisionBoardProfile()

  return (
    <DeviceSection title="BOARD">
      <BoardProfileRow
        boardName={provision.resolved?.profile.boardName ?? null}
        canProvision={provision.canProvision}
        busy={provision.state.kind === 'writing'}
        blockedNote={provisionBlockedNote(provision.resolved !== null, provision.linked)}
        note={provisionMessage(provision.state)}
        onProvision={provision.provision}
      />
      <button
        type="button"
        aria-expanded={definitionOpen}
        onClick={onToggleDefinition}
        className="mt-4 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11.5px] text-ui-muted hover:text-ui-ink"
      >
        {definitionOpen ? 'Hide the board definition' : 'Board definition — pins, driver, CAN…'}
      </button>
    </DeviceSection>
  )
}
