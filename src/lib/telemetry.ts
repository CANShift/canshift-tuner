import { isObservabilityEnabled, useObservabilityStore } from '../stores/observability.store'
import { setPostHogCapturing, startPostHog } from './posthog'

let subscribed = false

const applyConsent = (enabled: boolean): void => {
  if (enabled) startPostHog()
  setPostHogCapturing(enabled)
}

export const initTelemetry = (): void => {
  applyConsent(isObservabilityEnabled())
  if (subscribed) return
  useObservabilityStore.subscribe((state) => {
    applyConsent(state.enabled)
  })
  subscribed = true
}
