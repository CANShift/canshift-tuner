import { resolveScreenProfile, type ScreenProfileId } from '@canshift/core'

export const resolveTargetLabel = (
  offline: boolean,
  targetProfile: ScreenProfileId | undefined
): string | null =>
  offline || targetProfile === undefined ? null : resolveScreenProfile(targetProfile).name
