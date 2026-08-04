import type { BoardProfile } from '@canshift/core'

export const CUSTOM_BOARDS_KEY = 'canshift.tuner.board-profiles'
export const SELECTED_BOARD_KEY = 'canshift.tuner.selected-board'

export interface CustomBoardEntry {
  id: string
  name: string
  createdAt: string
  profile: BoardProfile
}

export type SelectedBoard = { source: 'catalog' | 'custom'; boardId: string }

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

const isEntry = (value: unknown): value is CustomBoardEntry => {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  if (typeof e.id !== 'string' || typeof e.name !== 'string' || typeof e.createdAt !== 'string') {
    return false
  }
  const profile = e.profile
  return (
    typeof profile === 'object' &&
    profile !== null &&
    typeof (profile as Record<string, unknown>).boardId === 'string'
  )
}

export const readCustomBoards = (): CustomBoardEntry[] => {
  const raw = safeGet(CUSTOM_BOARDS_KEY)
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  return Array.isArray(parsed) ? parsed.filter(isEntry) : []
}

export const writeCustomBoards = (entries: CustomBoardEntry[]): boolean =>
  safeSet(CUSTOM_BOARDS_KEY, JSON.stringify(entries))

export const readSelectedBoard = (): SelectedBoard | null => {
  const raw = safeGet(SELECTED_BOARD_KEY)
  if (raw === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const s = parsed as Record<string, unknown>
  if ((s.source !== 'catalog' && s.source !== 'custom') || typeof s.boardId !== 'string')
    return null
  return { source: s.source, boardId: s.boardId }
}

export const writeSelectedBoard = (selected: SelectedBoard | null): void => {
  if (selected === null) {
    try {
      localStorage.removeItem(SELECTED_BOARD_KEY)
    } catch {
      void 0
    }
    return
  }
  safeSet(SELECTED_BOARD_KEY, JSON.stringify(selected))
}
