import { useState } from 'react'
import { usbService } from '../transport'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { boardProfileBlob, type BoardProvision } from '../lib/board-provision'
import {
  failedOutcome,
  provisionOutcome,
  type ProvisionOutcome,
  type ProvisionState,
} from '../lib/provision-outcome'
import { useResolvedBoardProfile, type ResolvedBoardProfile } from './useResolvedBoardProfile'
import { errorMessage } from '../lib/error-message'

export type { ProvisionState }

const STATE_MESSAGES: Record<ProvisionState['kind'], (state: ProvisionState) => string | null> = {
  idle: () => null,
  writing: () => 'Writing the board profile…',
  ok: (state) =>
    state.kind === 'ok' && state.restart
      ? 'Board profile saved — the dash is rebooting to apply it.'
      : 'Board profile saved.',
  invalid: () => 'The firmware rejected this profile. Re-check the board definition on DEVICE.',
  'unknown-board': () =>
    'This firmware build has no driver for that board. Flash a build that lists it, or describe the board by hand on DEVICE.',
  error: (state) =>
    state.kind === 'error' ? `Board profile write failed — ${state.message}.` : null,
}

export const provisionMessage = (state: ProvisionState): string | null =>
  STATE_MESSAGES[state.kind](state)

export interface UseProvisionBoardProfile {
  resolved: ResolvedBoardProfile | null
  linked: boolean
  canProvision: boolean
  state: ProvisionState
  provision: () => void
  reset: () => void
}

const provisionFor = (resolved: ResolvedBoardProfile): BoardProvision =>
  resolved.source === 'catalog'
    ? { kind: 'catalog', boardId: resolved.profile.boardId }
    : { kind: 'custom', blob: boardProfileBlob(resolved.profile) }

const writeProfile = async (resolved: ResolvedBoardProfile): Promise<ProvisionOutcome> => {
  try {
    const result = await usbService.setBoardProfile(provisionFor(resolved))
    return provisionOutcome(result, resolved.profile.boardId)
  } catch (err) {
    return failedOutcome(errorMessage(err))
  }
}

export const useProvisionBoardProfile = (): UseProvisionBoardProfile => {
  const resolved = useResolvedBoardProfile()
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const log = useLogStore((s) => s.push)
  const [state, setState] = useState<ProvisionState>({ kind: 'idle' })

  const linked = connected && !simulationMode
  const canProvision = resolved !== null && linked && state.kind !== 'writing'

  const provision = () => {
    if (!resolved || !linked) return
    setState({ kind: 'writing' })
    log('info', `Provisioning board profile “${resolved.profile.boardName}”`)
    void writeProfile(resolved).then((outcome) => {
      setState(outcome.state)
      log(outcome.level, outcome.log)
    })
  }

  const reset = () => {
    setState({ kind: 'idle' })
  }

  return { resolved, linked, canProvision, state, provision, reset }
}
