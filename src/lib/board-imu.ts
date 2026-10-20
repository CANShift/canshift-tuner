import { boardHasImu, getBoardProfile } from '@canshift/core'

export const boardLacksImu = (boardId: string | null): boolean => {
  if (boardId === null) return false
  const profile = getBoardProfile(boardId)
  return profile !== undefined && !boardHasImu(profile)
}
