const CONTACT_ENDPOINT = 'https://tmbk.ch/api/contact/canshift'
const REPORTER_NAME = 'CANShift Tuner'
const FALLBACK_EMAIL = 'noreply@canshift.ch'
const SEND_TIMEOUT_MS = 8_000

export interface FeedbackInput {
  message: string
  email?: string
  route: string
  tunerVersion: string
}

export type FeedbackResult = { ok: true } | { ok: false; error: string }

const composeMessage = ({ message, route, tunerVersion }: FeedbackInput): string =>
  `${message}\n\n— route: ${route}\n— tuner: ${tunerVersion}`

const resolveEmail = (email?: string): string => {
  const trimmed = email?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : FALLBACK_EMAIL
}

export const submitFeedback = async (input: FeedbackInput): Promise<FeedbackResult> => {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, SEND_TIMEOUT_MS)

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: REPORTER_NAME,
        email: resolveEmail(input.email),
        message: composeMessage(input),
        company: '',
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      return { ok: false, error: `Feedback endpoint returned HTTP ${String(response.status)}` }
    }
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network unreachable'
    return { ok: false, error: message }
  } finally {
    clearTimeout(timer)
  }
}
