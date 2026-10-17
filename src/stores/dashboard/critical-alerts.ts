import { FIRMWARE_CAPS, type CriticalAlert } from '@canshift/core'
import { pushHistory } from './helpers'
import type { DashboardState } from './types'

const writeList = (s: DashboardState, alerts: CriticalAlert[]): void => {
  if (!s.config) return
  if (alerts.length === 0) delete s.config.criticalAlerts
  else s.config.criticalAlerts = alerts
}

const listOf = (s: DashboardState): CriticalAlert[] => s.config?.criticalAlerts ?? []

const hasEntry = (s: DashboardState, index: number): boolean =>
  index >= 0 && index < listOf(s).length

export const addCriticalAlertIn = (s: DashboardState, alert: CriticalAlert): void => {
  if (!s.config || listOf(s).length >= FIRMWARE_CAPS.MAX_CRITICAL_ALERTS) return
  pushHistory(s, 'Added a full-screen alert')
  writeList(s, [...listOf(s), alert])
}

export const updateCriticalAlertIn = (
  s: DashboardState,
  index: number,
  alert: CriticalAlert
): void => {
  if (!hasEntry(s, index)) return
  pushHistory(s, 'Changed a full-screen alert')
  writeList(
    s,
    listOf(s).map((entry, at) => (at === index ? alert : entry))
  )
}

export const removeCriticalAlertIn = (s: DashboardState, index: number): void => {
  if (!hasEntry(s, index)) return
  pushHistory(s, 'Removed a full-screen alert')
  writeList(
    s,
    listOf(s).filter((_, at) => at !== index)
  )
}
