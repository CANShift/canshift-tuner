import { create } from 'zustand'
import { readItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'

export interface LogEntry {
  id: number
  level: LogLevel
  message: string
  timestamp: Date
  scope?: string
  bridged?: boolean
}

interface LogState {
  entries: LogEntry[]
  verbose: boolean
  push: (level: LogLevel, message: string, scope?: string) => void
  pushFromBridge: (entry: LogEntry) => void
  setVerbose: (verbose: boolean) => void
  clear: () => void
}

const VERBOSE_STORAGE_KEY = STORAGE_KEYS.logVerbose

const readVerboseFlag = (): boolean => {
  if (typeof window === 'undefined') return false
  return readItem(VERBOSE_STORAGE_KEY) === '1'
}

const writeVerboseFlag = (verbose: boolean): void => {
  if (typeof window === 'undefined') return
  writeItem(VERBOSE_STORAGE_KEY, verbose ? '1' : '0')
}

export const LOG_RING_CAP = 2000

const appendCapped = (entries: LogEntry[], entry: LogEntry): LogEntry[] => {
  const next = entries.concat(entry)
  if (next.length > LOG_RING_CAP) {
    next.splice(0, next.length - LOG_RING_CAP)
  }
  return next
}

let nextId = 1

const withScope = (entry: LogEntry, scope: string | undefined): LogEntry =>
  scope === undefined ? entry : { ...entry, scope }

const localEntry = (level: LogLevel, message: string, scope?: string): LogEntry =>
  withScope({ id: nextId++, level, message, timestamp: new Date() }, scope)

const bridgedEntry = (entry: LogEntry): LogEntry =>
  withScope(
    {
      id: nextId++,
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      bridged: true,
    },
    entry.scope
  )

export const useLogStore = create<LogState>()((set, get) => {
  const dropped = (level: LogLevel): boolean => level === 'debug' && !get().verbose

  const append = (entry: LogEntry) => {
    set((s) => ({ entries: appendCapped(s.entries, entry) }))
  }

  return {
    entries: [],
    verbose: readVerboseFlag(),

    push: (level, message, scope) => {
      if (dropped(level)) return
      append(localEntry(level, message, scope))
    },

    pushFromBridge: (entry) => {
      if (dropped(entry.level)) return
      append(bridgedEntry(entry))
    },

    setVerbose: (verbose) => {
      writeVerboseFlag(verbose)
      set({ verbose })
    },

    clear: () => {
      set({ entries: [] })
    },
  }
})
