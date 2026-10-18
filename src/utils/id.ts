import { STRING_CAPS } from '@canshift/core'

let fallbackCounter = 0

export const newId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  fallbackCounter += 1
  return `id_${Date.now().toString(36)}_${fallbackCounter.toString(36)}`
}

export const createId = (prefix: string): string => {
  const room = STRING_CAPS.ID - prefix.length - 1
  return `${prefix}_${newId().replaceAll('-', '').slice(-room)}`
}
