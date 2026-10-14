import { errorMessage } from '../lib/error-message'

const PREVIEW_CHARS = 80

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseFrame = (line: string): Record<string, unknown> | null => {
  const trimmed = line.trim()
  if (trimmed.length === 0 || !trimmed.startsWith('{')) return null
  try {
    const parsed: unknown = JSON.parse(trimmed)
    return isRecord(parsed) ? parsed : null
  } catch (err) {
    const reason = errorMessage(err, 'unknown')
    const preview = trimmed.length > PREVIEW_CHARS ? `${trimmed.slice(0, PREVIEW_CHARS)}…` : trimmed
    console.warn(`[link] dropped malformed frame (${reason}): ${preview}`)
    return null
  }
}
