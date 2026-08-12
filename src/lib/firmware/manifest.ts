export const FALLBACK_BOARD_ID = 'crowpanel_28'

export interface ArtifactRef {
  file: string
  sha256: string | null
}

export interface BoardArtifacts {
  merged: ArtifactRef
  firmware: ArtifactRef
  spiffs: ArtifactRef
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

const SHA256_HEX_RE = /^[0-9a-f]{64}$/

const toArtifactRef = (value: unknown): ArtifactRef | null => {
  if (typeof value === 'string') return value.length > 0 ? { file: value, sha256: null } : null
  if (typeof value !== 'object' || value === null) return null
  const ref = value as Record<string, unknown>
  if (typeof ref.file !== 'string' || ref.file.length === 0) return null
  const sha = typeof ref.sha256 === 'string' ? ref.sha256.toLowerCase() : null
  return { file: ref.file, sha256: sha !== null && SHA256_HEX_RE.test(sha) ? sha : null }
}

const toArtifacts = (value: unknown): BoardArtifacts | null => {
  if (typeof value !== 'object' || value === null) return null
  const a = value as Record<string, unknown>
  const merged = toArtifactRef(a.merged)
  const firmware = toArtifactRef(a.firmware)
  const spiffs = toArtifactRef(a.spiffs)
  if (!merged || !firmware || !spiffs) return null
  return { merged, firmware, spiffs }
}

const toEntry = (value: unknown): BoardManifestEntry | null => {
  if (typeof value !== 'object' || value === null) return null
  const e = value as Record<string, unknown>
  if (
    typeof e.id !== 'string' ||
    typeof e.chip !== 'string' ||
    typeof e.display !== 'string' ||
    typeof e.touch !== 'string'
  ) {
    return null
  }
  const artifacts = toArtifacts(e.artifacts)
  if (!artifacts) return null
  return { id: e.id, chip: e.chip, display: e.display, touch: e.touch, artifacts }
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
  const boards = manifest.boards.map(toEntry).filter((b): b is BoardManifestEntry => b !== null)
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
