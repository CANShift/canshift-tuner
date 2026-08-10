import { inject } from '@vercel/analytics'
import { isObservabilityEnabled, useObservabilityStore } from '../stores/observability.store'
import { setPostHogCapturing, startPostHog } from './posthog'

let subscribed = false
let webAnalyticsStarted = false

const startWebAnalytics = (): void => {
  if (webAnalyticsStarted) return
  inject({ beforeSend: (event) => (isObservabilityEnabled() ? event : null) })
  webAnalyticsStarted = true
}

const applyConsent = (enabled: boolean): void => {
  if (enabled) {
    startPostHog()
    startWebAnalytics()
  }
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
