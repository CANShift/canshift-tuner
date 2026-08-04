import { getBoardProfile, type BoardProfile } from '@canshift/core'
import { useBoardConfigStore } from '../stores/board-config/board-config.store'
import { validateBoardProfile } from '../lib/board-profile'

export interface ResolvedBoardProfile {
  source: 'catalog' | 'custom'
  profile: BoardProfile
  blob: string
}

export const useResolvedBoardProfile = (): ResolvedBoardProfile | null => {
  const selected = useBoardConfigStore((s) => s.selected)
  const customBoards = useBoardConfigStore((s) => s.customBoards)

  if (!selected) return null

  const profile =
    selected.source === 'catalog'
      ? (getBoardProfile(selected.boardId) ?? null)
      : (customBoards.find((b) => b.id === selected.boardId)?.profile ?? null)

  if (!profile) return null

  const validation = validateBoardProfile(profile)
  if (!validation.ok) return null

  return { source: selected.source, profile, blob: validation.blob }
}
