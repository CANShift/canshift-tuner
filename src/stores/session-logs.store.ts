import { create } from 'zustand'
import { DEFAULT_UNIT_SYSTEM } from '@canshift/core'
import { decodeDatalog } from '@canshift/core/wire'
import { STRINGS } from '../strings'
import { downloadFile } from '../lib/download'
import { CSV_MIME } from '../lib/live-csv'
import { buildSessionCsv, sessionCsvFilename } from '../lib/session-csv'
import { getDashOrigin } from '../transport/link'
import {
  deleteLogFile,
  fetchLogFile,
  fetchLogIndex,
  type LogDeleteResult,
  type LogFileResult,
  type LogIndexResult,
  type SessionLog,
} from '../transport/session-logs-http'
import { useDashboardStore } from './dashboard.store'
import { useSignalStore } from './signal.store'
import { useToastStore, type ToastTone } from './toast.store'

const L = STRINGS.sessionLogs
const RAW_MIME = 'application/octet-stream'

export type LogsAvailability =
  'checking' | 'listed' | 'noCard' | 'unsupported' | 'unreachable' | 'noWifi'

export type LogFormat = 'raw' | 'csv'

interface SessionLogsState {
  availability: LogsAvailability
  logs: SessionLog[]
  busy: string | null
  load: () => Promise<void>
  download: (name: string, format: LogFormat) => Promise<void>
  remove: (name: string) => Promise<void>
}

const fromIndex = (index: LogIndexResult): Pick<SessionLogsState, 'availability' | 'logs'> => {
  if (index.kind !== 'listed') return { availability: index.kind, logs: [] }
  if (!index.card) return { availability: 'noCard', logs: [] }
  return {
    availability: 'listed',
    logs: [...index.logs].sort((a, b) => b.name.localeCompare(a.name)),
  }
}

const warn = (message: string): void => {
  useToastStore.getState().show(message, 'warning')
}

const saveCsv = (name: string, bytes: Uint8Array): void => {
  const decoded = decodeDatalog(bytes)
  if (!decoded.ok) {
    warn(L.unreadable)
    return
  }
  const system = useDashboardStore.getState().config?.units ?? DEFAULT_UNIT_SYSTEM
  const csv = buildSessionCsv(decoded.session, useSignalStore.getState().signals, system)
  downloadFile(sessionCsvFilename(name), CSV_MIME, csv)
}

const SAVERS: Record<LogFormat, (name: string, bytes: Uint8Array<ArrayBuffer>) => void> = {
  raw: (name, bytes) => downloadFile(name, RAW_MIME, bytes),
  csv: saveCsv,
}

type FileProblem = Exclude<LogFileResult['kind'], 'fetched'>

const FILE_PROBLEMS: Record<FileProblem, { message: string; reload: boolean }> = {
  missing: { message: L.gone, reload: true },
  unreachable: { message: L.downloadFailed, reload: false },
}

const DELETE_OUTCOMES: Record<
  LogDeleteResult['kind'],
  { message: string; tone: ToastTone; reload: boolean }
> = {
  deleted: { message: L.removed, tone: 'success', reload: true },
  missing: { message: L.gone, tone: 'success', reload: true },
  unreachable: { message: L.removeFailed, tone: 'warning', reload: false },
}

type Listing = Pick<SessionLogsState, 'availability' | 'logs'>

const readListing = async (): Promise<Listing> => {
  const origin = getDashOrigin()
  if (origin === null) return { availability: 'noWifi', logs: [] }
  return fromIndex(await fetchLogIndex(origin))
}

const deliverFile = (name: string, format: LogFormat, file: LogFileResult): boolean => {
  if (file.kind === 'fetched') {
    SAVERS[format](name, file.bytes)
    return false
  }
  const problem = FILE_PROBLEMS[file.kind]
  warn(problem.message)
  return problem.reload
}

const whileBusy = async <T>(
  set: (partial: Partial<SessionLogsState>) => void,
  name: string,
  run: (origin: string) => Promise<T>
): Promise<T | null> => {
  const origin = getDashOrigin()
  if (origin === null) return null
  set({ busy: name })
  const result = await run(origin)
  set({ busy: null })
  return result
}

export const useSessionLogsStore = create<SessionLogsState>()((set, get) => ({
  availability: 'checking',
  logs: [],
  busy: null,

  load: async () => {
    set({ availability: 'checking' })
    set(await readListing())
  },

  download: async (name, format) => {
    const file = await whileBusy(set, name, (origin) => fetchLogFile(origin, name))
    if (file !== null && deliverFile(name, format, file)) await get().load()
  },

  remove: async (name) => {
    const deleted = await whileBusy(set, name, (origin) => deleteLogFile(origin, name))
    if (deleted === null) return
    const outcome = DELETE_OUTCOMES[deleted.kind]
    useToastStore.getState().show(outcome.message, outcome.tone)
    if (outcome.reload) await get().load()
  },
}))
