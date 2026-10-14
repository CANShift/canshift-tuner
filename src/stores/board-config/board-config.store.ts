import { create, type StoreApi } from 'zustand'
import { getBoardProfile, type BoardProfile } from '@canshift/core'
import { validateBoardProfile } from '../../lib/board-profile'
import { createId } from '../../utils/id'
import {
  readCustomBoards,
  readSelectedBoard,
  writeCustomBoards,
  writeSelectedBoard,
  type CustomBoardEntry,
  type SelectedBoard,
} from './storage'

const BOARD_NAME_MAX = 64

export type SaveCustomResult = { ok: true; id: string } | { ok: false; issues: string[] }

interface BoardConfigState {
  customBoards: CustomBoardEntry[]
  selected: SelectedBoard | null
  selectCatalog: (boardId: string) => void
  selectCustom: (id: string) => void
  saveCustom: (name: string, profile: BoardProfile) => SaveCustomResult
  renameCustom: (id: string, name: string) => void
  deleteCustom: (id: string) => void
}

const nowIso = (): string => new Date().toISOString()

const boardName = (name: string): string => name.trim().slice(0, BOARD_NAME_MAX)

const customEntry = (id: string, name: string, profile: BoardProfile): CustomBoardEntry => ({
  id,
  name: boardName(name) || profile.boardName || 'Custom board',
  createdAt: nowIso(),
  profile,
})

const isSelectedCustom = (selected: SelectedBoard | null, id: string): boolean =>
  selected?.source === 'custom' && selected.boardId === id

type SetBoardConfig = StoreApi<BoardConfigState>['setState']
type GetBoardConfig = StoreApi<BoardConfigState>['getState']

const selectionActions = (set: SetBoardConfig, get: GetBoardConfig) => {
  const select = (selected: SelectedBoard) => {
    set({ selected })
    writeSelectedBoard(selected)
  }

  return {
    selectCatalog: (boardId: string) => {
      if (!getBoardProfile(boardId)) return
      select({ source: 'catalog', boardId })
    },

    selectCustom: (id: string) => {
      if (!get().customBoards.some((b) => b.id === id)) return
      select({ source: 'custom', boardId: id })
    },
  }
}

const customActions = (set: SetBoardConfig, get: GetBoardConfig) => ({
  saveCustom: (name: string, profile: BoardProfile): SaveCustomResult => {
    const validation = validateBoardProfile(profile)
    if (!validation.ok) return { ok: false, issues: validation.issues }
    const id = createId('board')
    const customBoards = [customEntry(id, name, profile), ...get().customBoards]
    const selected: SelectedBoard = { source: 'custom', boardId: id }
    set({ customBoards, selected })
    writeCustomBoards(customBoards)
    writeSelectedBoard(selected)
    return { ok: true, id }
  },

  renameCustom: (id: string, name: string) => {
    const trimmed = boardName(name)
    if (trimmed.length === 0) return
    const customBoards = get().customBoards.map((b) => (b.id === id ? { ...b, name: trimmed } : b))
    set({ customBoards })
    writeCustomBoards(customBoards)
  },

  deleteCustom: (id: string) => {
    const customBoards = get().customBoards.filter((b) => b.id !== id)
    const wasSelected = isSelectedCustom(get().selected, id)
    set(wasSelected ? { customBoards, selected: null } : { customBoards })
    writeCustomBoards(customBoards)
    if (wasSelected) writeSelectedBoard(null)
  },
})

export const useBoardConfigStore = create<BoardConfigState>()((set, get) => ({
  customBoards: readCustomBoards(),
  selected: readSelectedBoard(),
  ...selectionActions(set, get),
  ...customActions(set, get),
}))
