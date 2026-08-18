const NAMESPACE = 'canshift.tuner.'

const key = (name: string): string => `${NAMESPACE}${name}`

export const STORAGE_KEYS = {
  autosave: key('autosave'),
  boardProfiles: key('board-profiles'),
  cliOpen: key('cli-open'),
  feedbackDismissedHint: key('feedback-dismissed-hint'),
  flashHistory: key('flash-history'),
  inspectorCollapsed: key('inspector-collapsed'),
  logVerbose: key('log-verbose'),
  observability: key('observability'),
  pageTemplates: key('page-templates'),
  projectIndex: key('projects'),
  selectedBoard: key('selected-board'),
  simulationMode: key('simulation-mode'),
  signals: key('signals'),
  theme: key('theme'),
} as const

export const PROJECT_KEY_PREFIX = key('project.')

export const projectStorageKey = (id: string): string => `${PROJECT_KEY_PREFIX}${id}`

const LEGACY_KEYS: Record<string, string> = {
  'cs-inspector-collapsed': STORAGE_KEYS.inspectorCollapsed,
  'canshift:feedback-dismissed-hint': STORAGE_KEYS.feedbackDismissedHint,
  'canshift:signal-store-v1': STORAGE_KEYS.signals,
  'canshift.log.verbose': STORAGE_KEYS.logVerbose,
  'tuner.feedback.dismissed-hint': STORAGE_KEYS.feedbackDismissedHint,
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

export const removeItem = (name: string): void => {
  try {
    localStorage.removeItem(name)
  } catch {
    console.warn(`[storage] could not remove ${name}`)
  }
}

export const readJson = <T>(name: string, guard: (value: unknown) => value is T): T | null => {
  const raw = readItem(name)
  if (raw === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  return guard(parsed) ? parsed : null
}

export const writeJson = (name: string, value: unknown): boolean =>
  writeItem(name, JSON.stringify(value))

export const migrateLegacyKeys = (): void => {
  for (const [from, to] of Object.entries(LEGACY_KEYS)) {
    const legacy = readItem(from)
    if (legacy === null) continue
    if (readItem(to) === null) writeItem(to, legacy)
    removeItem(from)
  }
}
