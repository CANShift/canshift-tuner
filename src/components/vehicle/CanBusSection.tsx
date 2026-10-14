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

export const CanBusSection = ({ state, onWrite }: CanBusSectionProps) => {
  const current = configOf(state).canSpeedKbps
  const [draft, setDraft] = useState<CanSpeedKbps | null>(null)
  const editable = EDITABLE.has(state.kind)
  const chosen = draft ?? current

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
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={!editable || chosen === current}
          onClick={() => {
            onWrite(chosen)
            setDraft(null)
          }}
        >
          Write to the dash
        </Button>
      </div>
    </section>
  )
}
