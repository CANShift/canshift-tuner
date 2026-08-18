import { useMemo } from 'react'
import { resolveScreenProfile } from '@canshift/core'
import { useDeviceStore } from '../stores/device.store'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { ecuLabelForKey } from '../utils/ecu-label'
import { useCatalogueIndex } from './useCatalogueIndex'
import { platformLabel } from '../lib/platform-label'
import type { FeedbackContext } from '../lib/feedback'

const CONTEXT_LINES: readonly [keyof FeedbackContext, string][] = [
  ['appVersion', 'Tuner'],
  ['firmwareVersion', 'Firmware'],
  ['boardModel', 'Board'],
  ['platform', 'Platform'],
  ['ecuProfile', 'ECU profile'],
  ['pageCount', 'Pages'],
  ['widgetCount', 'Widgets'],
  ['simulation', 'Simulation'],
]

export interface ContactContext {
  context: FeedbackContext
  lines: string[]
}

export const useContactContext = (): ContactContext => {
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const config = useDashboardStore((s) => s.config)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const catalogue = useCatalogueIndex()

  return useMemo(() => {
    const widgets = config?.pages.reduce((total, page) => total + page.widgets.length, 0) ?? 0
    const context: FeedbackContext = {
      appVersion: __TUNER_VERSION__,
      ...(firmwareVersion !== null ? { firmwareVersion } : {}),
      boardModel: resolveScreenProfile(config?.targetProfile).name,
      platform: platformLabel(),
      ecuProfile: ecuLabelForKey(selectedProfileKey, catalogue),
      pageCount: config?.pages.length ?? 0,
      widgetCount: widgets,
      simulation: simulationMode,
    }
    const lines = CONTEXT_LINES.flatMap(([key, label]) => {
      const value = context[key]
      return value === undefined ? [] : [`${label}: ${String(value)}`]
    })
    return { context, lines }
  }, [firmwareVersion, simulationMode, config, selectedProfileKey, catalogue])
}
