const NAMESPACE = 'canshift.tuner.'

const key = (name: string): string => `${NAMESPACE}${name}`

export const STORAGE_KEYS = {
  autosave: key('autosave'),
  cliOpen: key('cli-open'),
  logVerbose: key('log-verbose'),
  setup: key('setup'),
  simulationMode: key('simulation-mode'),
  signals: key('signals'),
  signalsUnreadable: key('signals.unreadable'),
} as const

const LEGACY_KEYS: Record<string, string> = {
  'canshift:signal-store-v1': STORAGE_KEYS.signals,
  'canshift.log.verbose': STORAGE_KEYS.logVerbose,
}

export const readItem = (name: string): string | null => {
  try {
    return localStorage.getItem(name)
  } catch {
    return null
  }
}

export const writeItem = (name: string, value: string): boolean => {
  try {
    localStorage.setItem(name, value)
    return true
  } catch {
    console.warn(`[storage] could not persist ${name} — the change will not survive a reload`)
    return false
  }
}

export const removeItem = (name: string): boolean => {
  try {
    localStorage.removeItem(name)
    return true
  } catch {
    console.warn(`[storage] could not remove ${name}`)
    return false
  }
}

export const migrateLegacyKeys = (): void => {
  for (const [from, to] of Object.entries(LEGACY_KEYS)) {
    const legacy = readItem(from)
    if (legacy === null) continue
    if (readItem(to) === null) writeItem(to, legacy)
    removeItem(from)
  }
}
