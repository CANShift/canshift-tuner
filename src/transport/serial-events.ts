import { bestEffort } from './best-effort'

export type SerialStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

export type SerialActivityDirection = 'rx' | 'tx'

export type StatusListener = (status: SerialStatus, error?: string) => void
type ActivityListener = (direction: SerialActivityDirection) => void
type Handler<T> = (event: T) => void
type Unsubscribe = () => void

interface Subscription {
  discriminator: string
  handler: Handler<unknown>
}

export class SerialEventHub {
  private statusListeners: StatusListener[] = []
  private activityListeners: ActivityListener[] = []
  private subscriptions: Subscription[] = []

  onStatus(listener: StatusListener): Unsubscribe {
    this.statusListeners.push(listener)
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener)
    }
  }

  onActivity(listener: ActivityListener): Unsubscribe {
    this.activityListeners.push(listener)
    return () => {
      this.activityListeners = this.activityListeners.filter((l) => l !== listener)
    }
  }

  subscribe<T = unknown>(discriminator: string, handler: Handler<T>): Unsubscribe {
    const entry: Subscription = { discriminator, handler: handler as Handler<unknown> }
    this.subscriptions.push(entry)
    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== entry)
    }
  }

  emitActivity(direction: SerialActivityDirection): void {
    for (const listener of this.activityListeners) listener(direction)
  }

  emitStatus(status: SerialStatus, error?: string): void {
    for (const listener of this.statusListeners) {
      void bestEffort('[serial] status listener', () => {
        listener(status, error)
      })
    }
  }

  routeSubscription(parsed: Record<string, unknown>): void {
    for (const sub of this.subscriptions) {
      if (sub.discriminator in parsed) {
        void bestEffort(`[serial] ${sub.discriminator} subscriber`, () => {
          sub.handler(parsed)
        })
        return
      }
    }
  }
}
