import { useState } from 'react'
import type { BoardProfile } from '@canshift/core'
import { blankBoardDraft } from '../lib/board-profile'
import { useBoardConfigStore } from '../stores/board-config/board-config.store'

type BoardSectionKey = 'lcd' | 'backlight' | 'touch' | 'can' | 'storage' | 'conn'

export interface UseBoardDraft {
  draft: BoardProfile
  issues: string[]
  patch: (partial: Partial<BoardProfile>) => void
  patchSection: <K extends BoardSectionKey>(key: K, partial: Partial<BoardProfile[K]>) => void
  save: () => void
}

export const useBoardDraft = (): UseBoardDraft => {
  const saveCustom = useBoardConfigStore((s) => s.saveCustom)
  const [draft, setDraft] = useState<BoardProfile>(blankBoardDraft)
  const [issues, setIssues] = useState<string[]>([])

  const patch = (partial: Partial<BoardProfile>) => {
    setDraft((d) => ({ ...d, ...partial }))
  }

  const patchSection = <K extends BoardSectionKey>(key: K, partial: Partial<BoardProfile[K]>) => {
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...partial } }))
  }

  const save = () => {
    const result = saveCustom(draft.boardName, draft)
    if (result.ok) {
      setIssues([])
      setDraft(blankBoardDraft())
      return
    }
    setIssues(result.issues)
  }

  return { draft, issues, patch, patchSection, save }
}
