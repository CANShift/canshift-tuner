import { useState } from 'react'
import { usbService } from '../transport'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import {
  boardProfileBlob,
  type BoardProfileWriteResult,
  type BoardProvision,
} from '../lib/firmware/board-provision'
import { useResolvedBoardProfile, type ResolvedBoardProfile } from './useResolvedBoardProfile'
import { errorMessage } from '../lib/error-message'
import { transportErrorText } from '../transport/humanize-transport-error'

export type ProvisionState =
  | { kind: 'idle' }
  | { kind: 'writing' }
  | { kind: 'ok'; restart: boolean }
  | { kind: 'invalid' }
  | { kind: 'unknown-board' }
  | { kind: 'error'; message: string }

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
    log('info', `Provisioning board profile “${resolved.profile.boardName}” over USB`)
    void usbService
      .setBoardProfile(provisionFor(resolved))
      .then((result: BoardProfileWriteResult) => {
        if (result.kind === 'ok') {
          setState({ kind: 'ok', restart: result.restart })
          log(
            'success',
            result.restart
              ? 'Board profile saved — the dash is rebooting to apply it'
              : 'Board profile saved'
          )
          return
        }
        if (result.kind === 'invalid') {
          setState({ kind: 'invalid' })
          log('error', 'Firmware rejected the board profile (invalid_board_profile)')
          return
        }
        if (result.kind === 'unknown-board') {
          setState({ kind: 'unknown-board' })
          log('error', `This build has no board called “${resolved.profile.boardId}”`)
          return
        }
        setState({ kind: 'error', message: transportErrorText(result.error) })
        log('error', `Board profile write failed: ${transportErrorText(result.error)}`)
      })
      .catch((err: unknown) => {
        const message = errorMessage(err)
        setState({ kind: 'error', message })
        log('error', `Board profile write failed: ${message}`)
      })
  }

  const reset = () => {
    setState({ kind: 'idle' })
  }

  return { resolved, linked, canProvision, state, provision, reset }
}
