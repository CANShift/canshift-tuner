import posthog from 'posthog-js'
import { isObservabilityEnabled } from '../stores/observability.store'
import { scrubProps } from './scrub'

let started = false

export const startPostHog = (): void => {
  if (started) return
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return
  const host = import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com'
  posthog.init(key, {
    api_host: host,
    capture_pageview: false,
    autocapture: false,
    disable_session_recording: true,
    persistence: 'localStorage',
    person_profiles: 'identified_only',
  })
  started = true
}

export const setPostHogCapturing = (enabled: boolean): void => {
  if (!started) return
  if (enabled) {
    if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing()
  } else if (!posthog.has_opted_out_capturing()) {
    posthog.opt_out_capturing()
  }
}

export const captureFlowEvent = (name: string, props: Record<string, unknown> = {}): void => {
  if (!started || !isObservabilityEnabled()) return
  posthog.capture(name, {
    ...scrubProps(props),
    app: 'canshift-tuner',
    tunerBuild: __TUNER_BUILD__,
  })
}
