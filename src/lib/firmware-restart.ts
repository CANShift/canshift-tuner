import type { LinkKind } from '../transport/device-link'

export const INSTALLED_MESSAGES: Record<LinkKind, string> = {
  usb: 'Installed. The dash is restarting into the new firmware and reconnects on its own.',
  wifi: 'Installed. The dash restarted on its dashboard — enter workshop mode again to reconnect.',
}

type Disconnect = (notice: string) => void

const AFTER_INSTALL: Record<LinkKind, (disconnect: Disconnect) => void> = {
  usb: () => undefined,
  wifi: (disconnect) => {
    disconnect(INSTALLED_MESSAGES.wifi)
  },
}

export const releaseLinkAfterInstall = (kind: LinkKind, disconnect: Disconnect): void => {
  AFTER_INSTALL[kind](disconnect)
}
