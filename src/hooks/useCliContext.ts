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
import { sendToDash } from '../stores/sync/send-actions'
import type { CliContext, RawResult } from '../lib/cli/commands'

export interface CliPanelContext extends CliContext {
  deviceLabel: string
}

type CliActions = CliContext['actions']

const sendRaw: CliActions['raw'] = async (opcode, fields) => {
  const result = await usbService.sendRaw(opcode, fields)
  if (result.kind === 'ok') return { ok: true, text: JSON.stringify(result.data ?? {}) }
  return { ok: false, text: transportErrorText(result.error) }
}

const sendBurn = (): void => {
  void sendToDash()
}

const usePageActions = () => {
  const selectPage = useDashboardStore((s) => s.selectPage)
  const setDefaultPage = useDashboardStore((s) => s.setDefaultPage)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  return useMemo(
    () => ({ selectPage, setDefaultPage, setTheme, updateSignal }),
    [selectPage, setDefaultPage, setTheme, updateSignal]
  )
}

const useWidgetActions = () => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const copyWidgets = useDashboardStore((s) => s.copyWidgets)
  const pasteWidgets = useDashboardStore((s) => s.pasteWidgets)
  const undo = useDashboardStore((s) => s.undo)
  return useMemo(
    () => ({ updateWidget, copyWidgets, pasteWidgets, undo }),
    [updateWidget, copyWidgets, pasteWidgets, undo]
  )
}

const useProjectActions = () => {
  const configName = useDashboardStore((s) => s.config?.name)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const save = useProjectStore((s) => s.saveActiveProject)
  const { exportProjectFile, openImportPicker } = useProjectFileActions()
  return useMemo(
    () => ({
      save,
      exportConfig: () => {
        exportProjectFile(activeProjectId, configName ?? 'config')
      },
      importConfig: openImportPicker,
    }),
    [save, exportProjectFile, activeProjectId, configName, openImportPicker]
  )
}

const useCliActions = (): CliActions => {
  const pages = usePageActions()
  const widgets = useWidgetActions()
  const project = useProjectActions()
  const scan = useCanScanStore((s) => s.start)
  return useMemo(
    () => ({ raw: sendRaw, ...pages, ...widgets, ...project, burn: sendBurn, scan }),
    [pages, widgets, project, scan]
  )
}

const useDeviceLabel = (): { hasDevice: boolean; deviceLabel: string } => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const deviceLabel = `${resolveScreenProfile(targetProfile).name} · fw ${firmwareVersion ?? '—'}`
  return { hasDevice: connected && !simulationMode, deviceLabel }
}

export const useCliContext = (onAsync: (result: RawResult) => void): CliPanelContext => {
  const config = useDashboardStore((s) => s.config)
  const selectedPageId = useDashboardStore((s) => s.selectedPageId)
  const signals = useSignalStore((s) => s.signals)
  const { hasDevice, deviceLabel } = useDeviceLabel()
  const actions = useCliActions()
  return useMemo(
    () => ({
      config,
      selectedPageId,
      signals,
      hasDevice,
      deviceLabel,
      opcodes: KNOWN_OPCODES,
      onAsync,
      actions,
    }),
    [config, selectedPageId, signals, hasDevice, deviceLabel, onAsync, actions]
  )
}
