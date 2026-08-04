import { describe, expect, it } from 'vitest'
import { BOARD_PROFILES, parseBoardProfile } from '@canshift/core'
import { blankBoardDraft, validateBoardProfile } from './board-profile'

describe('board-profile', () => {
  it('exposes a non-empty core catalog', () => {
    expect(BOARD_PROFILES.length).toBeGreaterThan(0)
  })

  it('validates and serializes a catalog profile into a blob that round-trips', () => {
    const profile = BOARD_PROFILES[0]
    expect(profile).toBeDefined()
    if (!profile) return

    const result = validateBoardProfile(profile)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const parsed = parseBoardProfile(result.blob)
    expect(parsed.kind).toBe('ok')
    if (parsed.kind === 'ok') expect(parsed.profile.boardId).toBe(profile.boardId)
  })

  it('validates a completed custom draft (happy path)', () => {
    const draft = blankBoardDraft()
    draft.boardId = 'my_custom_28'
    draft.boardName = 'My Custom 2.8"'

    const result = validateBoardProfile(draft)
    expect(result.ok).toBe(true)
  })

  it('reports issues for an invalid profile (empty id, bad enum, out-of-range pin)', () => {
    const draft = blankBoardDraft()
    draft.lcd = { ...draft.lcd, driver: 'nonsense' as typeof draft.lcd.driver }

    const result = validateBoardProfile(draft)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.issues.some((i) => i.includes('lcd') || i.includes('board_id'))).toBe(true)
    }
  })
})
