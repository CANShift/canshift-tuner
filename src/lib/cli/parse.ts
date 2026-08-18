export interface CliInvocation {
  name: string
  args: string[]
}

const SLASH = '/'

export const parseCommand = (raw: string): CliInvocation | null => {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  const body = trimmed.startsWith(SLASH) ? trimmed.slice(1) : trimmed
  const parts = body.split(/\s+/).filter((part) => part.length > 0)
  const [name, ...args] = parts
  if (name === undefined) return null
  return { name: name.toLowerCase(), args }
}

export const suggest = (raw: string, names: readonly string[]): string[] => {
  const trimmed = raw.trim()
  if (!trimmed.startsWith(SLASH)) return []
  const typed = trimmed.slice(1).split(/\s+/)[0] ?? ''
  if (typed.length === 0) return [...names]
  const lower = typed.toLowerCase()
  return names.filter((name) => name.startsWith(lower))
}
