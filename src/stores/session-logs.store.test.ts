import { beforeEach, describe, expect, it, vi } from 'vitest'
import { decodeDatalog } from '@canshift/core/wire'
import { downloadFile } from '../lib/download'
import { STRINGS } from '../strings'
import { getDashOrigin } from '../transport/link'
import {
  deleteLogFile,
  fetchLogFile,
  fetchLogIndex,
  type LogIndexResult,
} from '../transport/session-logs-http'
import { useSessionLogsStore } from './session-logs.store'
import { useToastStore } from './toast.store'

vi.mock('../transport/link', () => ({ getDashOrigin: vi.fn() }))
vi.mock('../transport/session-logs-http', () => ({
  fetchLogIndex: vi.fn(),
  fetchLogFile: vi.fn(),
  deleteLogFile: vi.fn(),
}))
vi.mock('../lib/download', () => ({ downloadFile: vi.fn() }))
vi.mock('@canshift/core/wire', async (original) => ({
  ...(await original<typeof import('@canshift/core/wire')>()),
  decodeDatalog: vi.fn(),
}))

const L = STRINGS.sessionLogs
const ORIGIN = 'http://192.168.4.1'
const BYTES = Uint8Array.from([1, 2, 3])
const LOGS = [
  { name: 'S00001.csl', bytes: 10 },
  { name: 'S00002.csl', bytes: 20 },
]

const toast = () => useToastStore.getState().toast?.message

beforeEach(() => {
  vi.mocked(getDashOrigin).mockReset().mockReturnValue(ORIGIN)
  vi.mocked(fetchLogIndex).mockReset().mockResolvedValue({ kind: 'listed', card: true, logs: LOGS })
  vi.mocked(fetchLogFile).mockReset().mockResolvedValue({ kind: 'fetched', bytes: BYTES })
  vi.mocked(deleteLogFile).mockReset().mockResolvedValue({ kind: 'deleted' })
  vi.mocked(downloadFile).mockReset()
  vi.mocked(decodeDatalog).mockReset()
  useToastStore.setState({ toast: null })
  useSessionLogsStore.setState({ availability: 'checking', logs: [], busy: null })
})

describe('listing the sessions', () => {
  it('lists the newest session first', async () => {
    await useSessionLogsStore.getState().load()
    expect(useSessionLogsStore.getState().availability).toBe('listed')
    expect(useSessionLogsStore.getState().logs.map((log) => log.name)).toEqual([
      'S00002.csl',
      'S00001.csl',
    ])
  })

  it.each<[LogIndexResult, string]>([
    [{ kind: 'listed', card: false, logs: [] }, 'noCard'],
    [{ kind: 'unsupported' }, 'unsupported'],
    [{ kind: 'unreachable' }, 'unreachable'],
    [{ kind: 'refused' }, 'refused'],
    [{ kind: 'notOwner' }, 'notOwner'],
  ])('shows %o as %s', async (index, availability) => {
    vi.mocked(fetchLogIndex).mockResolvedValue(index)
    await useSessionLogsStore.getState().load()
    expect(useSessionLogsStore.getState().availability).toBe(availability)
  })

  it('asks for the dash Wi-Fi when the tuner does not run from a dash', async () => {
    vi.mocked(getDashOrigin).mockReturnValue(null)
    await useSessionLogsStore.getState().load()
    expect(useSessionLogsStore.getState().availability).toBe('noWifi')
    expect(fetchLogIndex).not.toHaveBeenCalled()
  })
})

describe('downloading a session', () => {
  it('saves the original file as it came off the card', async () => {
    await useSessionLogsStore.getState().download('S00002.csl', 'raw')
    expect(downloadFile).toHaveBeenCalledWith('S00002.csl', 'application/octet-stream', BYTES)
    expect(useSessionLogsStore.getState().busy).toBeNull()
  })

  it('turns a damaged file into a warning instead of an empty spreadsheet', async () => {
    vi.mocked(decodeDatalog).mockReturnValue({ ok: false, error: 'not_a_datalog' })
    await useSessionLogsStore.getState().download('S00002.csl', 'csv')
    expect(downloadFile).not.toHaveBeenCalled()
    expect(toast()).toBe(L.unreadable)
  })
})

describe('downloading a session as a spreadsheet', () => {
  it('saves a spreadsheet named after the session', async () => {
    vi.mocked(decodeDatalog).mockReturnValue({
      ok: true,
      session: {
        header: { samplePeriodMs: 50, session: 2, signals: [{ id: 0, name: 'rpm' }] },
        samples: [{ tMs: 0, values: { rpm: 900 } }],
        laps: [],
        end: null,
        truncated: true,
      },
    })
    await useSessionLogsStore.getState().download('S00002.csl', 'csv')
    expect(vi.mocked(downloadFile).mock.calls[0]?.[0]).toBe('S00002.csv')
  })

  it('refreshes the list when the session is gone', async () => {
    vi.mocked(fetchLogFile).mockResolvedValue({ kind: 'missing' })
    await useSessionLogsStore.getState().download('S00002.csl', 'raw')
    expect(toast()).toBe(L.gone)
    expect(fetchLogIndex).toHaveBeenCalledTimes(1)
  })
})

describe('deleting a session', () => {
  it('confirms and refreshes the list', async () => {
    await useSessionLogsStore.getState().remove('S00001.csl')
    expect(deleteLogFile).toHaveBeenCalledWith(ORIGIN, 'S00001.csl')
    expect(toast()).toBe(L.removed)
    expect(fetchLogIndex).toHaveBeenCalledTimes(1)
  })

  it('keeps the list when the dash did not answer', async () => {
    vi.mocked(deleteLogFile).mockResolvedValue({ kind: 'unreachable' })
    await useSessionLogsStore.getState().remove('S00001.csl')
    expect(toast()).toBe(L.removeFailed)
    expect(fetchLogIndex).not.toHaveBeenCalled()
  })
})

describe('a dash held by another tuner', () => {
  it('keeps the session and says who holds the dash', async () => {
    vi.mocked(deleteLogFile).mockResolvedValue({ kind: 'notOwner' })
    await useSessionLogsStore.getState().remove('S00001.csl')
    expect(toast()).toBe(L.notOwner)
    expect(fetchLogIndex).not.toHaveBeenCalled()
  })

  it('does not download from a dash that refused the page', async () => {
    vi.mocked(fetchLogFile).mockResolvedValue({ kind: 'refused' })
    await useSessionLogsStore.getState().download('S00001.csl', 'raw')
    expect(downloadFile).not.toHaveBeenCalled()
    expect(toast()).toBe(L.refused)
  })
})
