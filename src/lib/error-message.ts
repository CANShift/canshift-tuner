const DEFAULT_FALLBACK = 'unknown_error'

export const errorMessage = (err: unknown, fallback: string = DEFAULT_FALLBACK): string => {
  if (err instanceof Error && err.message.length > 0) return err.message
  if (typeof err === 'string' && err.length > 0) return err
  return fallback
}
