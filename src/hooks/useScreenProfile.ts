import { useMemo } from 'react'
import { resolveScreenProfile, type ScreenProfile } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'

export const useScreenProfile = (): ScreenProfile => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  return useMemo(() => resolveScreenProfile(targetProfile), [targetProfile])
}
