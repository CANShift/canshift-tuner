import { dashWriter } from '../../lib/sync/dash-writer'
import { preflightRefusals } from '../../lib/sync/preflight'
import { failureForCode } from '../../lib/sync/send-codes'
import { sendSetup, type DashWriter, type SendResult } from '../../lib/sync/send-setup'
import type { DashSetup } from '../../lib/sync/setup'
import { STRINGS } from '../../strings'
import { useDeviceStore } from '../device.store'
import { useSignalStore } from '../signal.store'
import { useToastStore } from '../toast.store'
import { readDraft } from './draft'
import { useSyncStore } from './sync.store'

const preflight = (draft: DashSetup) =>
  draft.dashboard === null
    ? []
    : preflightRefusals({
        config: draft.dashboard,
        signals: useSignalStore.getState().signals,
        firmwareMismatch: useDeviceStore.getState().firmwareCompat.kind === 'mismatch',
      })

const thrown = (device: DashSetup): SendResult => {
  const failure = failureForCode('exception')
  return failure.kind === 'refused'
    ? { kind: 'refused', confirmed: device, reasons: failure.reasons }
    : { kind: 'dropped', confirmed: device }
}

const attempt = async (draft: DashSetup, device: DashSetup, writer: DashWriter) => {
  try {
    return await sendSetup(draft, device, writer)
  } catch (err) {
    console.error('[send] the send threw', err)
    return thrown(device)
  }
}

const REPORTERS: Record<SendResult['kind'], (result: SendResult) => void> = {
  sent: (result) => {
    useSyncStore.getState().setSendState('idle')
    const restarting = result.kind === 'sent' && result.restarting
    useToastStore.getState().show(restarting ? STRINGS.send.sentRestarting : STRINGS.send.sent)
  },
  refused: (result) => {
    useSyncStore.getState().setSendState('refused', result.kind === 'refused' ? result.reasons : [])
  },
  dropped: () => {
    useSyncStore.getState().setSendState('failed')
  },
}

export const sendToDash = async (writer: DashWriter = dashWriter): Promise<void> => {
  const sync = useSyncStore.getState()
  if (sync.sendState === 'sending') return
  const draft = readDraft()
  const refusals = preflight(draft)
  if (refusals.length > 0) {
    sync.setSendState('refused', refusals)
    return
  }
  sync.setSendState('sending')
  const result = await attempt(draft, sync.device, writer)
  useSyncStore.getState().setDevice(result.confirmed)
  REPORTERS[result.kind](result)
}

export const dismissSendOutcome = (): void => {
  useSyncStore.getState().setSendState('idle')
}
