import { CURRENT_SCHEMA_VERSION, DashboardConfigSchema, migrateConfig } from '@canshift/core'
import type { DashboardConfig } from '@canshift/core'
import { readItem, writeItem, removeItem, STORAGE_KEYS } from '../../lib/local-storage'
import { parseJsonRecord } from '../../lib/json-record'

export const AUTOSAVE_KEY = STORAGE_KEYS.autosave
export const AUTOSAVE_DEBOUNCE_MS = 500

export interface AutosavePayload {
  config: DashboardConfig
  selectedPageId: string | null
  selectedWidgetId: string | null
  selectedWidgetIds: string[]
  savedAt: number
}

interface AutosaveSource {
  config: DashboardConfig | null
  selectedPageId: string | null
  selectedWidgetId: string | null
  selectedWidgetIds: string[]
}

export const serializeAutosave = (state: AutosaveSource, savedAt: number): string | null => {
  if (!state.config) return null
  const payload: AutosavePayload = {
    config: state.config,
    selectedPageId: state.selectedPageId,
    selectedWidgetId: state.selectedWidgetId,
    selectedWidgetIds: state.selectedWidgetIds,
    savedAt,
  }
  return JSON.stringify(payload)
}

const migrated = (config: unknown): Record<string, unknown> | null => {
  try {
    return migrateConfig(config as Record<string, unknown>, CURRENT_SCHEMA_VERSION).config
  } catch {
    return null
  }
}

export const validConfig = (config: unknown): DashboardConfig | null => {
  const parsed = DashboardConfigSchema.safeParse(migrated(config))
  return parsed.success ? (parsed.data as DashboardConfig) : null
}

type RestoredSelection = Pick<
  AutosavePayload,
  'selectedPageId' | 'selectedWidgetId' | 'selectedWidgetIds'
>

const knownId = (value: unknown, known: ReadonlySet<string>): value is string =>
  typeof value === 'string' && known.has(value)

const restoreSelection = (
  candidate: Record<string, unknown>,
  config: DashboardConfig
): RestoredSelection => {
  const pageIds = new Set(config.pages.map((p) => p.id))
  const widgetIds = new Set(config.pages.flatMap((p) => p.widgets.map((w) => w.id)))
  const { selectedPageId, selectedWidgetId, selectedWidgetIds } = candidate
  return {
    selectedPageId: knownId(selectedPageId, pageIds)
      ? selectedPageId
      : (config.pages[0]?.id ?? null),
    selectedWidgetId: knownId(selectedWidgetId, widgetIds) ? selectedWidgetId : null,
    selectedWidgetIds: Array.isArray(selectedWidgetIds)
      ? selectedWidgetIds.filter((id): id is string => knownId(id, widgetIds))
      : [],
  }
}

export const parseAutosave = (raw: string): AutosavePayload | null => {
  const candidate = parseJsonRecord(raw)
  if (candidate === null || typeof candidate.savedAt !== 'number') return null
  const config = validConfig(candidate.config)
  if (config === null) return null
  return {
    config,
    ...restoreSelection(candidate, config),
    savedAt: candidate.savedAt,
  }
}

export const readAutosave = (): AutosavePayload | null => {
  if (typeof window === 'undefined') return null
  const raw = readItem(AUTOSAVE_KEY)
  if (raw === null) return null
  const payload = parseAutosave(raw)
  if (payload === null) removeItem(AUTOSAVE_KEY)
  return payload
}

export const isRestorable = (payload: AutosavePayload | null): payload is AutosavePayload =>
  payload !== null

interface AutosaveStore {
  getState: () => AutosaveSource & { markAutosaved: (ts: number) => void }
  subscribe: (listener: () => void) => () => void
}

const snapshotOf = (store: AutosaveStore): AutosaveSource => {
  const s = store.getState()
  return {
    config: s.config,
    selectedPageId: s.selectedPageId,
    selectedWidgetId: s.selectedWidgetId,
    selectedWidgetIds: s.selectedWidgetIds,
  }
}

const sameSnapshot = (a: AutosaveSource | null, b: AutosaveSource): boolean =>
  a !== null &&
  a.config === b.config &&
  a.selectedPageId === b.selectedPageId &&
  a.selectedWidgetId === b.selectedWidgetId &&
  a.selectedWidgetIds === b.selectedWidgetIds

interface AutosaveWriter {
  schedule: () => void
  flush: () => void
  cancel: () => void
}

const createWriter = (store: AutosaveStore): AutosaveWriter => {
  let timer: number | null = null
  let lastWritten: AutosaveSource | null = null
  const cancel = () => {
    if (timer !== null) window.clearTimeout(timer)
    timer = null
  }
  const write = () => {
    const snapshot = snapshotOf(store)
    const savedAt = Date.now()
    const raw = sameSnapshot(lastWritten, snapshot) ? null : serializeAutosave(snapshot, savedAt)
    if (raw === null || !writeItem(AUTOSAVE_KEY, raw)) return
    lastWritten = snapshot
    store.getState().markAutosaved(savedAt)
  }
  const schedule = () => {
    if (sameSnapshot(lastWritten, snapshotOf(store))) return
    cancel()
    timer = window.setTimeout(() => {
      timer = null
      write()
    }, AUTOSAVE_DEBOUNCE_MS)
  }
  const flush = () => {
    cancel()
    write()
  }
  return { schedule, flush, cancel }
}

export const startAutosave = (store: AutosaveStore): (() => void) => {
  if (typeof window === 'undefined') return () => undefined
  const writer = createWriter(store)
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') writer.flush()
  }
  const unsubscribe = store.subscribe(writer.schedule)
  window.addEventListener('beforeunload', writer.flush)
  window.addEventListener('visibilitychange', onVisibilityChange)
  return () => {
    unsubscribe()
    writer.cancel()
    window.removeEventListener('beforeunload', writer.flush)
    window.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
