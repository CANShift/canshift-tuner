import { create } from 'zustand'
import type { BoardProfile } from '@canshift/core'
import { validateBoardProfile } from '../../lib/board-profile'
import { createId } from '../../utils/id'
import { captureFlowEvent } from '../../lib/posthog'
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

export const useBoardConfigStore = create<BoardConfigState>()((set, get) => ({
  customBoards: readCustomBoards(),
  selected: readSelectedBoard(),

  selectCatalog: (boardId) => {
    const selected: SelectedBoard = { source: 'catalog', boardId }
    set({ selected })
    writeSelectedBoard(selected)
  },

  selectCustom: (id) => {
    const selected: SelectedBoard = { source: 'custom', boardId: id }
    set({ selected })
    writeSelectedBoard(selected)
  },

  saveCustom: (name, profile) => {
    const validation = validateBoardProfile(profile)
    if (!validation.ok) return { ok: false, issues: validation.issues }
    const id = createId('board')
    const entry: CustomBoardEntry = {
      id,
      name: name.trim().slice(0, BOARD_NAME_MAX) || profile.boardName || 'Custom board',
      createdAt: nowIso(),
      profile,
    }
    const customBoards = [entry, ...get().customBoards]
    const selected: SelectedBoard = { source: 'custom', boardId: id }
    set({ customBoards, selected })
    writeCustomBoards(customBoards)
    writeSelectedBoard(selected)
    captureFlowEvent('custom_board_saved')
    return { ok: true, id }
  },

  renameCustom: (id, name) => {
    const trimmed = name.trim().slice(0, BOARD_NAME_MAX)
    if (trimmed.length === 0) return
    const customBoards = get().customBoards.map((b) => (b.id === id ? { ...b, name: trimmed } : b))
    set({ customBoards })
    writeCustomBoards(customBoards)
  },

  deleteCustom: (id) => {
    const customBoards = get().customBoards.filter((b) => b.id !== id)
    const current = get().selected
    const selected =
      current && current.source === 'custom' && current.boardId === id ? null : current
    set({ customBoards, selected })
    writeCustomBoards(customBoards)
    if (selected !== current) writeSelectedBoard(selected)
  },
}))
