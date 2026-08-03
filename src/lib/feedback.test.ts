import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitFeedback } from './feedback'

const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()

const parseBody = (init?: RequestInit): Record<string, unknown> =>
  JSON.parse(String(init?.body)) as Record<string, unknown>

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('submitFeedback', () => {
  it('posts to the canshift contact endpoint with an empty honeypot and context', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    const result = await submitFeedback({
      message: 'gauge flickers on reconnect',
      email: 'driver@example.com',
      route: '/editor',
      tunerVersion: '9.9.9',
    })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const call = fetchMock.mock.calls[0]
    expect(call).toBeDefined()
    const [url, init] = call ?? []
    expect(url).toBe('https://tmbk.ch/api/contact/canshift')
    expect(init?.method).toBe('POST')
    const body = parseBody(init)
    expect(body.company).toBe('')
    expect(body.name).toBe('CANShift Tuner')
    expect(body.email).toBe('driver@example.com')
    expect(body.message).toContain('gauge flickers on reconnect')
    expect(body.message).toContain('/editor')
    expect(body.message).toContain('9.9.9')
  })

  it('falls back to a noreply address when no email is provided', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))

    await submitFeedback({ message: 'anonymous report', route: '/', tunerVersion: '1.0.0' })

    const init = fetchMock.mock.calls[0]?.[1]
    expect(parseBody(init).email).toBe('noreply@canshift.ch')
  })

  it('returns an error result on a non-2xx response instead of throwing', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 502 }))

    const result = await submitFeedback({
      message: 'server error',
      route: '/',
      tunerVersion: '1.0.0',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('502')
  })

  it('returns an error result when the request throws while offline', async () => {
    fetchMock.mockRejectedValue(new Error('Failed to fetch'))

    const result = await submitFeedback({
      message: 'offline report',
      route: '/',
      tunerVersion: '1.0.0',
    })

    expect(result).toEqual({ ok: false, error: 'Failed to fetch' })
  })
})
