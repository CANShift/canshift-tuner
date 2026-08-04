import type { BoardManifest, BoardManifestEntry } from './manifest'

export type BoardSource = 'detected' | 'default' | 'none'

export interface BoardResolution {
  boards: BoardManifestEntry[]
  selectedId: string | null
  source: BoardSource
}

export const resolveBoardSelection = (
  manifest: BoardManifest | null,
  detectedBoardId: string | null
): BoardResolution => {
  if (!manifest) return { boards: [], selectedId: null, source: 'none' }
  const boards = manifest.boards
  const detected =
    detectedBoardId !== null ? (boards.find((board) => board.id === detectedBoardId) ?? null) : null
  if (detected) return { boards, selectedId: detected.id, source: 'detected' }
  return { boards, selectedId: boards[0]?.id ?? null, source: 'default' }
}

const normalizeChip = (chip: string): string => chip.toLowerCase().replace(/[^a-z0-9]/g, '')

export const chipFamiliesMatch = (expected: string, detected: string): boolean =>
  normalizeChip(expected) === normalizeChip(detected)
