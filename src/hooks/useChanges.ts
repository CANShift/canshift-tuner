import { useMemo } from 'react'
import type { Change } from '../lib/sync/change'
import { diffSetup } from '../lib/sync/diff-setup'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSyncStore } from '../stores/sync/sync.store'

export const useChanges = (): Change[] => {
  const dashboard = useDashboardStore((s) => s.config)
  const device = useSyncStore((s) => s.device)
  const settings = useSyncStore((s) => s.settingsDraft)
  return useMemo(() => diffSetup(device, { dashboard, settings }), [device, dashboard, settings])
}
