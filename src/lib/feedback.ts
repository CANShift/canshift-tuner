import { errorMessage } from './error-message'

const FEEDBACK_ENDPOINT = 'https://tmbk.ch/api/feedback/canshift'
const COMPONENT = 'tuner'
const SEND_TIMEOUT_MS = 15_000
const GENERIC_FAILURE = 'The report could not be sent. Try again in a moment.'

export type FeedbackKind = 'bug' | 'info' | 'ecu-request'

export interface FeedbackContext {
  appVersion: string
  firmwareVersion?: string
  boardModel?: string
  platform?: string
  ecuProfile?: string
  busRate?: string
  pageCount?: number
  widgetCount?: number
  simulation?: boolean
}

export interface FeedbackAttachment {
  name: string
  mimetype: string
  content: string
}

export interface FeedbackInput {
  kind: FeedbackKind
  email: string
  message: string
  context: FeedbackContext | null
  attachments: FeedbackAttachment[]
}

export type FeedbackResult = { ok: true } | { ok: false; error: string }

interface ApiError {
  error?: unknown
  message?: unknown
}

const serverMessage = async (response: Response): Promise<string> => {
  const body: unknown = await response.json().catch(() => null)
  if (typeof body !== 'object' || body === null) return GENERIC_FAILURE
  const message = (body as ApiError).message
  return typeof message === 'string' && message.length > 0 ? message : GENERIC_FAILURE
}

export const buildFeedbackBody = (input: FeedbackInput): Record<string, unknown> => ({
  kind: input.kind,
  component: COMPONENT,
  email: input.email.trim(),
  message: input.message.trim(),
  company: '',
  ...(input.context ?? {}),
  ...(input.attachments.length > 0 ? { attachments: input.attachments } : {}),
})

export const submitFeedback = async (input: FeedbackInput): Promise<FeedbackResult> => {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, SEND_TIMEOUT_MS)

  try {
    const response = await fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildFeedbackBody(input)),
      signal: controller.signal,
    })
    if (response.ok) return { ok: true }
    return { ok: false, error: await serverMessage(response) }
  } catch (error) {
    return { ok: false, error: errorMessage(error, 'Network unreachable') }
  } finally {
    clearTimeout(timer)
  }
}
