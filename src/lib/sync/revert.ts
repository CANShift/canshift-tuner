import type { PageConfig } from '@canshift/core'
import { produce, type Draft } from 'immer'
import type { Change, ChangeRevert } from './change'
import type { DashSetup } from './setup'
import { indexAt, readPath, writePath, type SetupPath } from './setup-path'

const revertPath = (draft: Draft<DashSetup>, device: DashSetup, path: SetupPath): void => {
  const value = structuredClone(readPath(device, path))
  writePath(draft, path, value, indexAt(device, path))
}

const devicePosition = (device: DashSetup): Map<string, number> =>
  new Map((device.dashboard?.pages ?? []).map((page, index) => [page.id, index]))

const revertOrder = (draft: Draft<DashSetup>, device: DashSetup): void => {
  if (draft.dashboard === null) return
  const position = devicePosition(device)
  const rank = (page: PageConfig): number => position.get(page.id) ?? Number.MAX_SAFE_INTEGER
  draft.dashboard.pages.sort((a, b) => rank(a as PageConfig) - rank(b as PageConfig))
}

const REVERTERS: Record<
  ChangeRevert['kind'],
  (draft: Draft<DashSetup>, device: DashSetup, revert: ChangeRevert) => void
> = {
  path: (draft, device, revert) => {
    if (revert.kind === 'path') revertPath(draft, device, revert.path)
  },
  order: revertOrder,
  whole: () => undefined,
}

export const revertChange = (draft: DashSetup, device: DashSetup, change: Change): DashSetup =>
  produce(draft, (next) => {
    REVERTERS[change.revert.kind](next, device, change.revert)
  })

export const revertAll = (draft: DashSetup, device: DashSetup): DashSetup => ({
  dashboard: device.dashboard === null ? draft.dashboard : structuredClone(device.dashboard),
  settings: {
    deviceConfig: device.settings.deviceConfig ?? draft.settings.deviceConfig,
    brightness: device.settings.brightness ?? draft.settings.brightness,
  },
})
