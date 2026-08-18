import { useMemo } from 'react'
import { resolveScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore } from '../stores/device.store'
import { useSignalStore } from '../stores/signal.store'
import { useProjectStore } from '../stores/project/project.store'
import { useCanScanStore } from '../stores/can-scan/can-scan.store'
import { usbService, KNOWN_OPCODES } from '../transport'
import { transportErrorText } from '../transport/humanize-transport-error'
import { useProjectFileActions } from './useProjectFileActions'
import { useBurnDashboard } from './useBurnDashboard'
import type { CliContext, RawResult } from '../lib/cli/commands'

export interface CliPanelContext extends CliContext {
  deviceLabel: string
}

export const useCliContext = (onAsync: (result: RawResult) => void): CliPanelContext => {
  const config = useDashboardStore((s) => s.config)
  const selectedPageId = useDashboardStore((s) => s.selectedPageId)
  const selectPage = useDashboardStore((s) => s.selectPage)
  const setDefaultPage = useDashboardStore((s) => s.setDefaultPage)
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const copyWidgets = useDashboardStore((s) => s.copyWidgets)
  const pasteWidgets = useDashboardStore((s) => s.pasteWidgets)
  const undo = useDashboardStore((s) => s.undo)
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject)
  const startScan = useCanScanStore((s) => s.start)
  const { exportProjectFile, openImportPicker } = useProjectFileActions()
  const { requestBurn } = useBurnDashboard()

  const hasDevice = connected && !simulationMode
  const deviceLabel = `${resolveScreenProfile(config?.targetProfile).name} · fw ${firmwareVersion ?? '—'}`

  return useMemo(
    () => ({
      config,
      selectedPageId,
      signals,
      hasDevice,
      deviceLabel,
      opcodes: KNOWN_OPCODES,
      onAsync,
      actions: {
        raw: async (opcode, fields) => {
          const result = await usbService.sendRaw(opcode, fields)
          if (result.kind === 'ok') return { ok: true, text: JSON.stringify(result.data ?? {}) }
          return { ok: false, text: transportErrorText(result.error) }
        },
        selectPage,
        setDefaultPage,
        updateWidget,
        updateSignal,
        setTheme,
        copyWidgets,
        pasteWidgets,
        undo,
        save: saveActiveProject,
        exportConfig: () => {
          exportProjectFile(activeProjectId, config?.name ?? 'config')
        },
        importConfig: openImportPicker,
        burn: requestBurn,
        scan: startScan,
      },
    }),
    [
      config,
      selectedPageId,
      signals,
      hasDevice,
      deviceLabel,
      onAsync,
      selectPage,
      setDefaultPage,
      updateWidget,
      updateSignal,
      setTheme,
      copyWidgets,
      pasteWidgets,
      undo,
      saveActiveProject,
      exportProjectFile,
      activeProjectId,
      openImportPicker,
      requestBurn,
      startScan,
    ]
  )
}
