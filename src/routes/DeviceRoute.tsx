import { lazy, Suspense, useState } from 'react'
import {
  SCREEN_PROFILES,
  THEME_PRESETS,
  defaultThemePreset,
  resolveScreenProfile,
} from '@canshift/core'
import type { ScreenProfileId, ThemePreset } from '@canshift/core'
import { RouteLoading } from '../components/shell/RouteLoading'
import { BoardBand } from '../components/device/BoardBand'
import { SettingRow } from '../components/device/SettingRow'
import { ThemeSampleCard } from '../components/device/ThemeSampleCard'
import { DayNightControl } from '../components/device/DayNightControl'
import { SignalsAction } from '../components/signals/SignalsToolbar'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore } from '../stores/device.store'
import { useSignalStore } from '../stores/signal.store'
import { useScreenSettingsStore } from '../stores/screen-settings.store'
import { useProjectStore } from '../stores/project/project.store'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { useCatalogueIndex } from '../hooks/useCatalogueIndex'
import { ecuLabelForKey } from '../utils/ecu-label'
import { useDisplayUnits } from '../hooks/useDisplayUnits'
import { UNIT_SYSTEM_OPTIONS } from '../constants/units'
import type { UnitSystem } from '@canshift/core'
import { PROJECT_FILE_ACCEPT } from '../lib/project-file'

const BoardConfigRoute = lazy(() => import('./BoardConfigRoute'))

const BRIGHTNESS_STEPS = [20, 40, 60, 80, 100]
const TRANSPORT = 'USB CDC'
const UNSET = '—'

const SECTION_HEAD = 'border-b-2 border-ui-rule pb-3 font-mono text-[10.5px] tracking-[0.18em]'

const samePreset = (a: ThemePreset | undefined, b: ThemePreset): boolean =>
  a !== undefined && JSON.stringify(a) === JSON.stringify(b)

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? '' : 's'}`

const DeviceRoute = () => {
  const config = useDashboardStore((s) => s.config)
  const setTargetProfile = useDashboardStore((s) => s.setTargetProfile)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const isDayMode = useDeviceStore((s) => s.isDayMode)
  const selectedProfileKey = useSignalStore((s) => s.selectedProfileKey)
  const brightness = useScreenSettingsStore((s) => s.brightness)
  const updateScreen = useScreenSettingsStore((s) => s.update)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const catalogue = useCatalogueIndex()
  const units = useDisplayUnits()
  const { fileInputRef, exportProjectFile, openImportPicker, handleImportChange } =
    useProjectFileActions()
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const screen = resolveScreenProfile(config?.targetProfile)
  const pages = config?.pages.length ?? 0
  const widgets = config?.pages.reduce((total, page) => total + page.widgets.length, 0) ?? 0
  const activeTheme = config?.theme ?? defaultThemePreset()
  const face = isDayMode === true ? 'day' : 'night'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ui-bg">
      <div className="flex h-[54px] shrink-0 items-center gap-4 border-b-2 border-ui-rule px-7">
        <span className="font-mono text-[11px] tracking-[0.18em] text-ui-muted">DEVICE</span>
        <span className="whitespace-nowrap font-mono text-[11.5px] text-ui-muted">
          {config === null
            ? 'no config open'
            : `${plural(pages, 'page')} · ${plural(widgets, 'widget')}`}
        </span>
        <div className="ml-auto flex gap-2">
          <SignalsAction onClick={openImportPicker}>Import</SignalsAction>
          <SignalsAction
            onClick={() => {
              exportProjectFile(activeProjectId, config?.name ?? 'config')
            }}
          >
            Export
          </SignalsAction>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {simulationMode && (
          <p className="border-b border-l-[3px] border-ui-line border-l-ui-accent bg-ui-panel px-7 py-3.5 font-mono text-[12.5px] text-ui-ink">
            No board attached — these are the values your config will write, not what a dash
            reports.
          </p>
        )}

        <BoardBand
          facts={[
            { label: 'MODEL', value: screen.name },
            { label: 'DISPLAY', value: `${String(screen.width)} × ${String(screen.height)}` },
            { label: 'FIRMWARE', value: firmwareVersion ?? UNSET },
            { label: 'TRANSPORT', value: TRANSPORT },
            { label: 'ECU PROFILE', value: ecuLabelForKey(selectedProfileKey, catalogue) },
            { label: 'CONFIG', value: `${plural(pages, 'page')} · ${plural(widgets, 'widget')}` },
          ]}
        />

        <section className="border-b border-ui-line px-7 pb-[34px] pt-[30px]">
          <h2 className={`${SECTION_HEAD} text-ui-muted`}>SETTINGS</h2>
          <div className="grid gap-x-10 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            <SettingRow
              label="MODEL"
              note="The panel the layout is measured against."
              value={screen.id}
              options={SCREEN_PROFILES.map((profile) => ({
                value: profile.id,
                label: profile.name,
              }))}
              onChange={(value) => {
                setTargetProfile(value as ScreenProfileId)
              }}
            />
            <SettingRow
              label="UNITS"
              note="Switches every signal that has an imperial equivalent."
              value={units.system}
              options={UNIT_SYSTEM_OPTIONS}
              onChange={(value) => {
                units.setSystem(value as UnitSystem)
              }}
            />
            <SettingRow
              label="BRIGHTNESS"
              note="Backlight level the dash boots at."
              value={String(brightness)}
              options={BRIGHTNESS_STEPS.map((step) => ({
                value: String(step),
                label: `${String(step)} %`,
              }))}
              onChange={(value) => {
                updateScreen({ brightness: Number(value) })
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setAdvancedOpen((open) => !open)
            }}
            className="mt-4 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11.5px] text-ui-muted hover:text-ui-ink"
          >
            {advancedOpen ? 'Hide the board definition' : 'Board definition — pins, driver, CAN…'}
          </button>
          {advancedOpen && (
            <div className="mt-4 border-t border-ui-line pt-4">
              <Suspense fallback={<RouteLoading />}>
                <BoardConfigRoute />
              </Suspense>
            </div>
          )}
        </section>

        <section className="px-7 pb-11 pt-[30px]">
          <div className={`${SECTION_HEAD} flex items-center justify-between gap-4 text-ui-muted`}>
            <h2>THEME</h2>
            <DayNightControl />
          </div>
          <div className="mt-5 grid max-w-[720px] gap-px [grid-template-columns:repeat(3,minmax(0,1fr))]">
            {THEME_PRESETS.map((entry) => (
              <ThemeSampleCard
                key={entry.id}
                entry={entry}
                face={face}
                active={samePreset(activeTheme, entry.preset)}
                onSelect={() => {
                  setTheme(entry.preset)
                }}
              />
            ))}
          </div>
        </section>
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
