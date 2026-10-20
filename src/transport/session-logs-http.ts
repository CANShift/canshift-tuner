import { z } from 'zod'

const LOGS_PATH = '/api/logs'
const HTTP_NOT_FOUND = 404
const HTTP_METHOD_NOT_ALLOWED = 405
const HTTP_FORBIDDEN = 403
const HTTP_CONFLICT = 409

const LogIndexWireSchema = z.object({
  card: z.boolean(),
  logs: z.array(z.object({ name: z.string().min(1), bytes: z.number().int().nonnegative() })),
})

export interface SessionLog {
  name: string
  bytes: number
}

type LogRefusal = { kind: 'refused' } | { kind: 'notOwner' }

export type LogIndexResult =
  | { kind: 'listed'; card: boolean; logs: SessionLog[] }
  | { kind: 'unsupported' }
  | { kind: 'unreachable' }
  | LogRefusal

export type LogFileResult =
  | { kind: 'fetched'; bytes: Uint8Array<ArrayBuffer> }
  | { kind: 'missing' }
  | { kind: 'unreachable' }
  | LogRefusal

export type LogDeleteResult =
  { kind: 'deleted' } | { kind: 'missing' } | { kind: 'unreachable' } | LogRefusal

const REFUSALS: Readonly<Record<number, LogRefusal>> = {
  [HTTP_FORBIDDEN]: { kind: 'refused' },
  [HTTP_CONFLICT]: { kind: 'notOwner' },
}

const indexUrl = (origin: string): string => `${origin}${LOGS_PATH}`

const fileUrl = (origin: string, name: string): string =>
  `${origin}${LOGS_PATH}/${encodeURIComponent(name)}`

const request = async (url: string, init?: RequestInit): Promise<Response | null> => {
  try {
    return await fetch(url, init)
  } catch {
    return null
  }
}

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

const readBytes = async (response: Response): Promise<Uint8Array<ArrayBuffer> | null> => {
  try {
    return new Uint8Array(await response.arrayBuffer())
  } catch {
    return null
  }
}

const isUnsupported = (status: number): boolean =>
  status === HTTP_NOT_FOUND || status === HTTP_METHOD_NOT_ALLOWED

const parseIndex = async (response: Response): Promise<LogIndexResult> => {
  const parsed = LogIndexWireSchema.safeParse(await readJson(response))
  return parsed.success ? { kind: 'listed', ...parsed.data } : { kind: 'unsupported' }
}

export const fetchLogIndex = async (origin: string): Promise<LogIndexResult> => {
  const response = await request(indexUrl(origin), { cache: 'no-store' })
  if (response === null) return { kind: 'unreachable' }
  const refusal = REFUSALS[response.status]
  if (refusal !== undefined) return refusal
  if (isUnsupported(response.status)) return { kind: 'unsupported' }
  if (!response.ok) return { kind: 'unreachable' }
  return parseIndex(response)
}

export const fetchLogFile = async (origin: string, name: string): Promise<LogFileResult> => {
  const response = await request(fileUrl(origin, name), { cache: 'no-store' })
  if (response === null) return { kind: 'unreachable' }
  const refusal = REFUSALS[response.status]
  if (refusal !== undefined) return refusal
  if (response.status === HTTP_NOT_FOUND) return { kind: 'missing' }
  const bytes = response.ok ? await readBytes(response) : null
  return bytes === null ? { kind: 'unreachable' } : { kind: 'fetched', bytes }
}

export const deleteLogFile = async (origin: string, name: string): Promise<LogDeleteResult> => {
  const response = await request(fileUrl(origin, name), { method: 'DELETE' })
  if (response === null) return { kind: 'unreachable' }
  const refusal = REFUSALS[response.status]
  if (refusal !== undefined) return refusal
  if (response.status === HTTP_NOT_FOUND) return { kind: 'missing' }
  return response.ok ? { kind: 'deleted' } : { kind: 'unreachable' }
}
