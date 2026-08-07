import * as Sentry from '@sentry/react'
import { isObservabilityEnabled } from '../stores/observability.store'
import { useDeviceStore } from '../stores/device.store'
import { scrubText } from './scrub'

let initialized = false

export const scrubEvent = (event: Sentry.ErrorEvent): Sentry.ErrorEvent => {
  delete event.request
  delete event.user
  if (event.message) event.message = scrubText(event.message)
  for (const value of event.exception?.values ?? []) {
    if (value.value) value.value = scrubText(value.value)
  }
  return event
}

export const scrubBreadcrumb = (breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb => {
  if (breadcrumb.message) breadcrumb.message = scrubText(breadcrumb.message)
  delete breadcrumb.data
  return breadcrumb
}

export const initSentry = (): void => {
  if (initialized) return
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) return

  Sentry.init({
    dsn,
    release: `canshift-tuner@${__TUNER_VERSION__}`,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    beforeSend: (event) => (isObservabilityEnabled() ? scrubEvent(event) : null),
    beforeBreadcrumb: (breadcrumb) =>
      isObservabilityEnabled() ? scrubBreadcrumb(breadcrumb) : null,
  })
  initialized = true

  useDeviceStore.subscribe((state) => {
    Sentry.setTag('firmware.version', state.firmwareVersion ?? 'disconnected')
  })
}

export const isSentryReady = (): boolean => initialized

export const addErrorBreadcrumb = (level: 'warning' | 'error', message: string): void => {
  if (!initialized || !isObservabilityEnabled()) return
  Sentry.addBreadcrumb({ category: 'tuner.log', level, message: scrubText(message) })
}

export const captureBoundaryError = (error: Error, scope: string): void => {
  if (!initialized || !isObservabilityEnabled()) return
  Sentry.captureException(error, { tags: { boundary: scope } })
}
