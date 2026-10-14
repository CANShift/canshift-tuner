import { lazy, Suspense, useState } from 'react'
import { resolveScreenProfile } from '@canshift/core'
import { RouteLoading } from '../components/shell/RouteLoading'
import { BoardBand } from '../components/device/BoardBand'
import { ConfigBackupSection } from '../components/device/ConfigBackupSection'
import { DeviceSection } from '../components/device/DeviceSection'
import { DeviceSettingsSection } from '../components/device/DeviceSettingsSection'
import { BoardProfileSection } from '../components/device/BoardProfileSection'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore, type Transport } from '../stores/device.store'
import { useSignalStore } from '../stores/signal.store'
import { useProjectStore } from '../stores/project/project.store'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { useResolvedBoardProfile } from '../hooks/useResolvedBoardProfile'
import { CATALOGUE_INDEX } from '../lib/ecu-catalogue'
import { ecuLabelForKey } from '../utils/ecu-label'
import { PROJECT_FILE_ACCEPT } from '../lib/project-file'
import type { DashboardConfig } from '@canshift/core'

const BoardConfigRoute = lazy(() => import('./BoardConfigRoute'))

const TRANSPORT_LABELS: Record<Transport, string> = { usb: 'USB', wifi: 'Wi-Fi' }
const UNSET = '—'

const displayFact = (screen: { width: number; height: number }, driver: string | null): string => {
  const size = `${String(screen.width)} × ${String(screen.height)}`
  return driver === null ? size : `${driver.toUpperCase()} · ${size}`
}

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? '' : 's'}`

const summarizeConfig = (config: DashboardConfig | null): string => {
  if (config === null) return 'no config open'
  const widgets = config.pages.reduce((total, page) => total + page.widgets.length, 0)
  return `${plural(config.pages.length, 'page')} · ${plural(widgets, 'widget')}`
}

const DeviceRoute = () => {
  const config = useDashboardStore((s) => s.config)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const transport = useDeviceStore((s) => s.transport)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const panelDriver = useResolvedBoardProfile()?.profile.lcd.driver ?? null
  const { fileInputRef, exportProjectFile, openImportPicker, handleImportChange } =
    useProjectFileActions()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const screen = resolveScreenProfile(config?.targetProfile)
  const configSummary = summarizeConfig(config)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {simulationMode && (
          <p className="border-b border-l-[3px] border-ui-line border-l-ui-accent bg-ui-panel px-4 py-3.5 font-mono sm:px-7 text-[12.5px] text-ui-ink">
            No board attached — these are the values your config will write, not what a dash
            reports.
          </p>
        )}

        <BoardBand
          facts={[
            { label: 'MODEL', value: screen.name },
            { label: 'DISPLAY', value: displayFact(screen, panelDriver) },
            { label: 'FIRMWARE', value: firmwareVersion ?? UNSET },
            { label: 'TRANSPORT', value: transport === null ? UNSET : TRANSPORT_LABELS[transport] },
            { label: 'ECU PROFILE', value: ecuLabelForKey(selectedProfileKey, CATALOGUE_INDEX) },
            { label: 'CONFIG', value: configSummary },
          ]}
        />

        <div className="grid gap-x-14 gap-y-10 px-4 pb-11 sm:px-7 pt-[30px] min-[1100px]:[grid-template-columns:minmax(380px,460px)_minmax(0,1fr)]">
          <DeviceSettingsSection />
          <div className="flex min-w-0 flex-col gap-10">
            <BoardProfileSection
              definitionOpen={advancedOpen}
              onToggleDefinition={() => {
                setAdvancedOpen((open) => !open)
              }}
            />
            <ConfigBackupSection
              summary={configSummary}
              onExport={() => {
                exportProjectFile(activeProjectId, config?.name ?? 'config')
              }}
              onImport={openImportPicker}
            />
          </div>
          {advancedOpen && (
            <div className="min-[1100px]:col-span-2">
              <DeviceSection title="BOARD DEFINITION">
                <div className="pt-4">
                  <Suspense fallback={<RouteLoading />}>
                    <BoardConfigRoute />
                  </Suspense>
                </div>
              </DeviceSection>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={PROJECT_FILE_ACCEPT}
        onChange={(event) => {
          void handleImportChange(event)
        }}
        className="hidden"
      />
    </div>
  )
}

export default DeviceRoute
