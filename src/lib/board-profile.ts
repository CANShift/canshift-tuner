import {
  BOARD_PROFILES,
  BoardProfileWireSchema,
  boardProfileToWire,
  getBoardProfile,
  serializeBoardProfile,
  type BoardProfile,
} from '@canshift/core'

const SEED_BOARD_ID = 'crowpanel_28'

export type BoardValidation = { ok: true; blob: string } | { ok: false; issues: string[] }

export const validateBoardProfile = (profile: BoardProfile): BoardValidation => {
  const result = BoardProfileWireSchema.safeParse(boardProfileToWire(profile))
  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues.map(
        (issue) => `${issue.path.join('.') || 'profile'}: ${issue.message}`
      ),
    }
  }
  return { ok: true, blob: serializeBoardProfile(profile) }
}

export const blankBoardDraft = (): BoardProfile => {
  const seed = getBoardProfile(SEED_BOARD_ID) ?? BOARD_PROFILES[0]
  if (!seed) throw new Error('no board profiles available in the catalog')
  return { ...structuredClone(seed), boardId: '', boardName: '' }
}
