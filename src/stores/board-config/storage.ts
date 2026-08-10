import type { BoardProfile } from '@canshift/core'
import { readItem, writeItem, removeItem, STORAGE_KEYS } from '../../lib/local-storage'

export const CUSTOM_BOARDS_KEY = STORAGE_KEYS.boardProfiles
export const SELECTED_BOARD_KEY = STORAGE_KEYS.selectedBoard

export interface CustomBoardEntry {
  id: string
  name: string
  createdAt: string
  profile: BoardProfile
}

export type SelectedBoard = { source: 'catalog' | 'custom'; boardId: string }

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
  const raw = readItem(CUSTOM_BOARDS_KEY)
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
  writeItem(CUSTOM_BOARDS_KEY, JSON.stringify(entries))

export const readSelectedBoard = (): SelectedBoard | null => {
  const raw = readItem(SELECTED_BOARD_KEY)
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
    removeItem(SELECTED_BOARD_KEY)
    return
  }
  writeItem(SELECTED_BOARD_KEY, JSON.stringify(selected))
}
