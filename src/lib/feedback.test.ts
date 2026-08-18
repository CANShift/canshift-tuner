import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitFeedback, buildFeedbackBody, type FeedbackInput } from './feedback'

const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()

const parseBody = (init?: RequestInit): Record<string, unknown> =>
  JSON.parse(String(init?.body)) as Record<string, unknown>

const input = (overrides: Partial<FeedbackInput> = {}): FeedbackInput => ({
  kind: 'bug',
  email: 'driver@example.com',
  message: 'gauge flickers on reconnect',
  context: null,
  attachments: [],
  ...overrides,
})

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildFeedbackBody', () => {
  it('always carries the empty honeypot and names the tuner as the component', () => {
    const body = buildFeedbackBody(input())
    expect(body.company).toBe('')
    expect(body.component).toBe('tuner')
    expect(body.kind).toBe('bug')
  })

  it('flattens the context beside the message, not nested under a key', () => {
    const body = buildFeedbackBody(
      input({
        context: { appVersion: '9.9.9', ecuProfile: 'MegaSquirt MS3', pageCount: 6 },
      })
    )
    expect(body.appVersion).toBe('9.9.9')
    expect(body.ecuProfile).toBe('MegaSquirt MS3')
    expect(body.pageCount).toBe(6)
  })

  it('omits the context entirely when the user removed it', () => {
    const body = buildFeedbackBody(input({ context: null }))
    expect(body).not.toHaveProperty('appVersion')
    expect(body).not.toHaveProperty('ecuProfile')
  })

  it('omits attachments when there are none, rather than sending an empty array', () => {
    expect(buildFeedbackBody(input())).not.toHaveProperty('attachments')
  })

  it('trims the email and the message', () => {
    const body = buildFeedbackBody(input({ email: '  a@b.co  ', message: '  hello  ' }))
    expect(body.email).toBe('a@b.co')
    expect(body.message).toBe('hello')
  })
})

describe('submitFeedback', () => {
  it('posts to the canshift feedback endpoint', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    const result = await submitFeedback(input())

    expect(result).toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('https://tmbk.ch/api/feedback/canshift')
    expect(init?.method).toBe('POST')
    expect(parseBody(init).message).toBe('gauge flickers on reconnect')
  })

  it("surfaces the server's own sentence on a rejected attachment", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'invalid_attachment',
          message: 'log.txt exceeds the 5 MB limit.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const result = await submitFeedback(input())

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('log.txt exceeds the 5 MB limit.')
  })

  it('never renders a bare status code when the server says nothing useful', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 502 }))

    const result = await submitFeedback(input())

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).not.toContain('502')
      expect(result.error.length).toBeGreaterThan(0)
    }
  })

  it('returns an error result when the request throws while offline', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'))

    const result = await submitFeedback(input())

    expect(result).toEqual({ ok: false, error: 'Failed to fetch' })
  })
})
