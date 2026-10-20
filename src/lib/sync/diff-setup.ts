import type { DashboardConfig, UnitSystem } from '@canshift/core'
import { STRINGS } from '../../strings'
import type { Change } from './change'
import { pageName, settingName, wasText, type ChangeSection } from './describe'
import { carChanges } from './diff-car'
import { pageChanges } from './diff-pages'
import type { DashSetup, DeviceSettings } from './setup'
import { pathKey, readPath, sameValue, type SetupPath } from './setup-path'

const C = STRINGS.changes

type Config = Record<string, unknown>

interface TopLevelCopy {
  section: ChangeSection
  what: (after: Config) => string
  was: (before: Config) => string
}

const unitLabel = (value: unknown): string =>
  value === 'imperial' ? STRINGS.dash.imperial : STRINGS.dash.metric

const unitsCopy: TopLevelCopy = {
  section: 'dash',
  what: (after) => C.units(unitLabel(after.units as UnitSystem | undefined)),
  was: (before) => C.was(unitLabel(before.units)),
}

const TOP_LEVEL: Record<string, TopLevelCopy> = {
  units: unitsCopy,
  criticalAlerts: {
    section: 'dash',
    what: (after) => (after.criticalAlerts === undefined ? C.alertOff : C.alertChanged),
    was: () => '',
  },
  pageButtons: {
    section: 'dash',
    what: (after) => (after.pageButtons === undefined ? C.pageButtonsOff : C.pageButtonsChanged),
    was: () => '',
  },
  topBar: { section: 'gauges', what: () => C.topBar, was: () => '' },
  theme: { section: 'gauges', what: () => C.theme, was: () => '' },
  defaultPageId: {
    section: 'gauges',
    what: (after) => C.firstPage(pageName({ id: String(after.defaultPageId) })),
    was: () => '',
  },
  ecuProfileKey: { section: 'car', what: () => C.car, was: () => '' },
}

const SECTION_WHERE: Record<ChangeSection, string> = {
  gauges: C.gaugesWhere,
  car: C.carWhere,
  dash: C.dashWhere,
}

const fallbackCopy = (key: string): TopLevelCopy => ({
  section: 'dash',
  what: () => C.setting(settingName(key)),
  was: (before) => wasText(before[key]),
})

const SKIPPED_KEYS = new Set(['pages', 'version'])

const topLevelChange = (before: Config, after: Config, key: string): Change => {
  const copy = TOP_LEVEL[key] ?? fallbackCopy(key)
  const path: SetupPath = ['dashboard', key]
  return {
    id: pathKey(path),
    section: copy.section,
    where: SECTION_WHERE[copy.section],
    what: copy.what(after),
    was: copy.was(before),
    revert: { kind: 'path', path },
    target: null,
  }
}

const topLevelChanges = (before: DashboardConfig, after: DashboardConfig): Change[] => {
  const b = before as unknown as Config
  const a = after as unknown as Config
  return [...new Set([...Object.keys(b), ...Object.keys(a)])]
    .filter((key) => !SKIPPED_KEYS.has(key) && !sameValue(b[key], a[key]))
    .map((key) => topLevelChange(b, a, key))
}

const WHOLE_SETUP: Change = {
  id: 'dashboard',
  section: 'gauges',
  where: C.gaugesWhere,
  what: C.wholeSetup,
  was: '',
  revert: { kind: 'whole' },
  target: null,
}

const dashboardChanges = (device: DashSetup, draft: DashSetup): Change[] => {
  if (draft.dashboard === null) return []
  if (device.dashboard === null) return [WHOLE_SETUP]
  return [
    ...pageChanges(device.dashboard.pages, draft.dashboard.pages),
    ...topLevelChanges(device.dashboard, draft.dashboard),
  ]
}

type SettingValue = number | boolean

interface SettingCopy {
  path: SetupPath
  what: (value: SettingValue) => string
  shown: (value: SettingValue) => string
}

const modeName = (value: SettingValue): string => (value === true ? C.day : C.night)

const onOff = (value: SettingValue): string => (value === true ? C.on : C.off)

const SETTINGS: readonly SettingCopy[] = [
  {
    path: ['settings', 'brightness'],
    what: (v) => C.brightness(Number(v)),
    shown: (v) => C.percent(Number(v)),
  },
  {
    path: ['settings', 'deviceConfig', 'canSpeedKbps'],
    what: (v) => C.canSpeed(Number(v)),
    shown: (v) => C.kbps(Number(v)),
  },
  {
    path: ['settings', 'rotation'],
    what: (v) => C.rotation(Number(v)),
    shown: (v) => C.degrees(Number(v)),
  },
  { path: ['settings', 'dayMode'], what: (v) => C.dayMode(modeName(v)), shown: modeName },
  {
    path: ['settings', 'sound', 'volume'],
    what: (v) => C.volume(Number(v)),
    shown: (v) => C.percent(Number(v)),
  },
  { path: ['settings', 'sound', 'boot'], what: (v) => C.bootSound(onOff(v)), shown: onOff },
  { path: ['settings', 'sound', 'shiftTone'], what: (v) => C.shiftTone(onOff(v)), shown: onOff },
]

const isSetting = (value: unknown): value is SettingValue =>
  typeof value === 'number' || typeof value === 'boolean'

const settingChange = (copy: SettingCopy, before: unknown, after: SettingValue): Change => ({
  id: pathKey(copy.path),
  section: 'dash',
  where: C.dashWhere,
  what: copy.what(after),
  was: isSetting(before) ? C.was(copy.shown(before)) : '',
  revert: { kind: 'path', path: copy.path },
  target: null,
})

const settingsChanges = (device: DeviceSettings, draft: DeviceSettings): Change[] =>
  SETTINGS.flatMap((copy) => {
    const before = readPath({ settings: device }, copy.path)
    const after = readPath({ settings: draft }, copy.path)
    if (!isSetting(after) || sameValue(before, after)) return []
    return [settingChange(copy, before, after)]
  })

export const diffSetup = (device: DashSetup, draft: DashSetup): Change[] => [
  ...dashboardChanges(device, draft),
  ...settingsChanges(device.settings, draft.settings),
  ...carChanges(device.car, draft.car),
]
