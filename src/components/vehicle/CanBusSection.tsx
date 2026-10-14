import { useState } from 'react'
import type { CanSpeedKbps } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { SettingRow } from '../device/SettingRow'
import { CAN_SPEED_OPTIONS, canSpeedNote, configOf, parseCanSpeed } from '../../lib/can-speed'
import type { CanSpeedState } from '../../lib/can-speed'

export interface CanBusSectionProps {
  state: CanSpeedState
  onWrite: (speed: CanSpeedKbps) => void
}

const EDITABLE = new Set<CanSpeedState['kind']>(['ready', 'written', 'error'])

const useSpeedDraft = (state: CanSpeedState, onWrite: (speed: CanSpeedKbps) => void) => {
  const current = configOf(state).canSpeedKbps
  const [draft, setDraft] = useState<CanSpeedKbps | null>(null)
  const chosen = draft ?? current
  const write = () => {
    onWrite(chosen)
    setDraft(null)
  }
  return { chosen, changed: chosen !== current, setDraft, write }
}

export const CanBusSection = ({ state, onWrite }: CanBusSectionProps) => {
  const { chosen, changed, setDraft, write } = useSpeedDraft(state, onWrite)
  const editable = EDITABLE.has(state.kind)

  return (
    <section className="max-w-[560px] px-6 py-6">
      <SettingRow
        label="BUS SPEED"
        note={canSpeedNote(state)}
        value={String(chosen)}
        options={CAN_SPEED_OPTIONS}
        disabled={!editable}
        onChange={(value) => {
          setDraft(parseCanSpeed(value))
        }}
      />
      <Button
        className="mt-4"
        variant="outline"
        size="sm"
        disabled={!editable || !changed}
        onClick={write}
      >
        Write to the dash
      </Button>
    </section>
  )
}
