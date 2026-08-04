export const FALLBACK_BOARD_ID = 'crowpanel_28'

export interface BoardArtifacts {
  merged: string
  firmware: string
  spiffs: string
}

export interface BoardManifestEntry {
  id: string
  chip: string
  display: string
  touch: string
  artifacts: BoardArtifacts
}

export interface BoardManifest {
  schema: number
  version: string
  tag: string
  boards: BoardManifestEntry[]
}

const isArtifacts = (value: unknown): value is BoardArtifacts => {
  if (typeof value !== 'object' || value === null) return false
  const a = value as Record<string, unknown>
  return (
    typeof a.merged === 'string' && typeof a.firmware === 'string' && typeof a.spiffs === 'string'
  )
}

const isEntry = (value: unknown): value is BoardManifestEntry => {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.chip === 'string' &&
    typeof e.display === 'string' &&
    typeof e.touch === 'string' &&
    isArtifacts(e.artifacts)
  )
}

export const parseManifest = (raw: string): BoardManifest | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const manifest = parsed as Record<string, unknown>
  if (typeof manifest.schema !== 'number') return null
  if (typeof manifest.version !== 'string' || typeof manifest.tag !== 'string') return null
  if (!Array.isArray(manifest.boards)) return null
  const boards = manifest.boards.filter(isEntry)
  if (boards.length === 0) return null
  return { schema: manifest.schema, version: manifest.version, tag: manifest.tag, boards }
}

export const boardLabel = (id: string): string =>
  id
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const boardSummary = (entry: BoardManifestEntry): string =>
  `${entry.chip.toUpperCase()} · ${entry.display} · ${entry.touch}`

export const findBoard = (manifest: BoardManifest, boardId: string): BoardManifestEntry | null =>
  manifest.boards.find((board) => board.id === boardId) ?? null
