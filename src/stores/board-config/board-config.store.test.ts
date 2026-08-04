import { beforeEach, describe, expect, it } from 'vitest'
import { BOARD_PROFILES } from '@canshift/core'
import { blankBoardDraft } from '../../lib/board-profile'
import { useBoardConfigStore } from './board-config.store'
import { readCustomBoards, readSelectedBoard } from './storage'

const memoryStorage = (): Storage => {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => {
      map.clear()
    },
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k)
    },
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
  }
}

const validDraft = () => {
  const draft = blankBoardDraft()
  draft.boardId = 'custom_one'
  draft.boardName = 'Custom One'
  return draft
}

describe('board-config store', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage()
    useBoardConfigStore.setState({ customBoards: [], selected: null })
  })

  it('selects a catalog board and persists the selection', () => {
    const first = BOARD_PROFILES[0]
    expect(first).toBeDefined()
    if (!first) return

    useBoardConfigStore.getState().selectCatalog(first.boardId)
    expect(useBoardConfigStore.getState().selected).toEqual({
      source: 'catalog',
      boardId: first.boardId,
    })
    expect(readSelectedBoard()).toEqual({ source: 'catalog', boardId: first.boardId })
  })

  it('saves a valid custom board, persists it, and selects it', () => {
    const result = useBoardConfigStore.getState().saveCustom('Custom One', validDraft())
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(useBoardConfigStore.getState().customBoards).toHaveLength(1)
    expect(useBoardConfigStore.getState().selected).toEqual({
      source: 'custom',
      boardId: result.id,
    })
    expect(readCustomBoards()).toHaveLength(1)
    expect(readSelectedBoard()?.boardId).toBe(result.id)
  })

  it('refuses an invalid custom board and stores nothing', () => {
    const bad = blankBoardDraft()
    bad.boardId = ''
    bad.lcd = { ...bad.lcd, panelWidth: -5 }

    const result = useBoardConfigStore.getState().saveCustom('Bad', bad)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.length).toBeGreaterThan(0)
    expect(useBoardConfigStore.getState().customBoards).toHaveLength(0)
    expect(readCustomBoards()).toHaveLength(0)
  })

  it('deletes a custom board and clears the selection when it was selected', () => {
    const result = useBoardConfigStore.getState().saveCustom('Custom One', validDraft())
    expect(result.ok).toBe(true)
    if (!result.ok) return

    useBoardConfigStore.getState().deleteCustom(result.id)
    expect(useBoardConfigStore.getState().customBoards).toHaveLength(0)
    expect(useBoardConfigStore.getState().selected).toBeNull()
    expect(readCustomBoards()).toHaveLength(0)
  })
})
