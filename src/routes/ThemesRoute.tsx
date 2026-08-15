import { useState } from 'react'
import { THEME_PRESETS, defaultThemePreset } from '@canshift/core'
import type { ThemePreset, ThemePresetEntry } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { usbService } from '../transport'
import { ThemeCard } from '../components/themes/ThemeCard'
import { ThemeTokensRail } from '../components/themes/ThemeTokensRail'
import { ThemeStatusCard } from '../components/themes/ThemeStatusCard'
import { ThemeControls } from '../components/themes/ThemeControls'
import { transportErrorText } from '../transport/humanize-transport-error'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RouteBody, RoutePage } from '../components/ui/route-shell'

const samePreset = (a: ThemePreset | undefined, b: ThemePreset): boolean =>
  a !== undefined && JSON.stringify(a) === JSON.stringify(b)

const ThemesRoute = () => {
  const config = useDashboardStore((s) => s.config)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const isDayMode = useDeviceStore((s) => s.isDayMode)
  const setIsDayMode = useDeviceStore((s) => s.setIsDayMode)
  const log = useLogStore((s) => s.push)
  const [busy, setBusy] = useState(false)

  const canControl = connected && !simulationMode

  const activeTheme = config?.theme ?? defaultThemePreset()
  const previewFace = isDayMode === true ? 'day' : 'night'
  const isCustom =
    config !== null && THEME_PRESETS.every((entry) => !samePreset(config.theme, entry.preset))

  const applyPreset = (entry: ThemePresetEntry) => {
    setTheme(entry.preset)
    log('success', `Theme set to "${entry.label}" — burn to apply on the device`)
  }

  const onToggle = async () => {
    setBusy(true)
    const result = await usbService.toggleDayNight()
    if (result.success) {
      const next = isDayMode === true ? false : isDayMode === false ? true : null
      setIsDayMode(next)
      log(
        'success',
        `Theme toggled to ${next === true ? 'Day' : next === false ? 'Night' : 'unknown'}`
      )
    } else {
      log('error', `Theme toggle failed: ${transportErrorText(result.error)}`)
    }
    setBusy(false)
  }

  const onSetDay = async () => {
    setBusy(true)
    const result = await usbService.setDayNight(true)
    if (result.success) {
      setIsDayMode(true)
      log('success', 'Theme forced to Day')
    } else {
      log('error', `Set Day failed: ${transportErrorText(result.error)}`)
    }
    setBusy(false)
  }

  const onSetNight = async () => {
    setBusy(true)
    const result = await usbService.setDayNight(false)
    if (result.success) {
      setIsDayMode(false)
      log('success', 'Theme forced to Night')
    } else {
      log('error', `Set Night failed: ${transportErrorText(result.error)}`)
    }
    setBusy(false)
  }

  return (
    <RoutePage>
      <RouteHeader title="Themes" subtitle="applies to every page on the device" />
      <RouteBody>
        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 content-start gap-5">
            {THEME_PRESETS.map((entry) => (
              <ThemeCard
                key={entry.id}
                entry={entry}
                active={samePreset(config?.theme, entry.preset)}
                previewFace={previewFace}
                onSelect={() => {
                  applyPreset(entry)
                }}
              />
            ))}
          </div>
        </div>
        <ThemeTokensRail
          title={`${previewFace.toUpperCase()} — TOKENS`}
          face={activeTheme[previewFace]}
        >
          <ThemeStatusCard
            isDayMode={isDayMode}
            connected={connected}
            simulationMode={simulationMode}
          />
          <ThemeControls
            isDayMode={isDayMode}
            disabled={!canControl}
            busy={busy}
            onToggle={() => {
              void onToggle()
            }}
            onSetDay={() => {
              void onSetDay()
            }}
            onSetNight={() => {
              void onSetNight()
            }}
          />
          {isCustom && (
            <div className="border border-brand-neutral-300 px-3.5 py-2.5 text-xs text-brand-neutral-500">
              This dashboard carries a custom pair of faces that matches no preset. Picking one
              below replaces both.
            </div>
          )}
          {!canControl && (
            <div className="border border-brand-neutral-300 px-3.5 py-2.5 text-xs text-brand-neutral-500">
              Theme commands are sent over USB. Connect a device to enable them.
            </div>
          )}
        </ThemeTokensRail>
      </RouteBody>
    </RoutePage>
  )
}

export default ThemesRoute
