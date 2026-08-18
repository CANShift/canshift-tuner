import { resolveScreenProfile, tierForPanel } from '@canshift/core'
import type { DisplayTier } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'

export const useDisplayTier = (): DisplayTier => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const screen = resolveScreenProfile(targetProfile)
  return tierForPanel(screen.width, screen.height)
}
