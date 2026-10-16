import { STRINGS } from '../strings'
import { sendToDash } from '../stores/sync/send-actions'
import { useSyncStore } from '../stores/sync/sync.store'
import { useChanges } from './useChanges'
import { useConnection } from './useConnection'

export interface SendButtonState {
  label: string
  disabled: boolean
  busy: boolean
  send: () => void
}

const labelFor = (connected: boolean, busy: boolean): string => {
  if (busy) return STRINGS.send.sending
  return connected ? STRINGS.send.idle : STRINGS.send.waiting
}

export const useSendButton = (): SendButtonState => {
  const count = useChanges().length
  const { connection } = useConnection()
  const busy = useSyncStore((s) => s.sendState === 'sending')
  const connected = connection === 'connected'
  return {
    label: labelFor(connected, busy),
    disabled: busy || !connected || count === 0,
    busy,
    send: () => {
      void sendToDash()
    },
  }
}
