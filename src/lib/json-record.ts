export type JsonRecord = Record<string, unknown>

export const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const parseJsonRecord = (raw: string): JsonRecord | null => {
  try {
    const parsed: unknown = JSON.parse(raw)
    return isJsonRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}
