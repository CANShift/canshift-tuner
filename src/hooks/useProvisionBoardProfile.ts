import { useState } from 'react'
import { usbService } from '../transport'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { boardProfileBlob, type BoardProfileWriteResult } from '../lib/firmware/board-provision'
import { useResolvedBoardProfile, type ResolvedBoardProfile } from './useResolvedBoardProfile'
import { errorMessage } from '../lib/error-message'
import { transportErrorText } from '../transport/humanize-transport-error'

export type ProvisionState =
  | { kind: 'idle' }
  | { kind: 'writing' }
  | { kind: 'ok'; restart: boolean }
  | { kind: 'invalid' }
  | { kind: 'error'; message: string }

export interface UseProvisionBoardProfile {
  resolved: ResolvedBoardProfile | null
  linked: boolean
  canProvision: boolean
  state: ProvisionState
  provision: () => void
  reset: () => void
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
    log('info', `Provisioning board profile “${resolved.profile.boardName}” over USB`)
    void usbService
      .setBoardProfile(boardProfileBlob(resolved.profile))
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
