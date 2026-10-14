import type { AckResult, SendOptions } from './ack-queue'
import type { SerialActivityDirection, SerialStatus, StatusListener } from './serial-events'

export type LinkKind = 'usb' | 'wifi'

export interface DeviceLink {
  readonly kind: LinkKind
  getStatus: () => SerialStatus
  onStatus: (listener: StatusListener) => () => void
  onActivity: (listener: (direction: SerialActivityDirection) => void) => () => void
  subscribe: <T = unknown>(discriminator: string, handler: (event: T) => void) => () => void
  send: (cmd: number, fields?: Record<string, unknown>, opts?: SendOptions) => Promise<AckResult>
  connect: () => Promise<void>
  autoConnect: () => Promise<void>
  disconnect: () => void
}
