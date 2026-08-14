import { resolveScreenProfile, type ScreenProfileId } from '@canshift/core'

export const resolveTargetLabel = (
  offline: boolean,
  targetProfile: ScreenProfileId | undefined,
  boardId?: string | null
): string | null => {
  if (offline) return null
  if (boardId) return boardId
  return targetProfile === undefined ? null : resolveScreenProfile(targetProfile).name
}
