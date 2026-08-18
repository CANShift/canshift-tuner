import { resolveScreenProfile, tierForPanel } from '@canshift/core'
import type { DashboardConfig, GridTracks, ScreenProfileId } from '@canshift/core'

export const gridTracksForProfile = (targetProfile: ScreenProfileId | undefined): GridTracks => {
  const screen = resolveScreenProfile(targetProfile)
  return tierForPanel(screen.width, screen.height)
}

export const gridTracksForConfig = (config: DashboardConfig | null): GridTracks =>
  gridTracksForProfile(config?.targetProfile)
