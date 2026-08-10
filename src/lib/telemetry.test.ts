import { beforeEach, describe, expect, it, vi } from 'vitest'

const posthogMock = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
}))

const injectMock = vi.hoisted(() => vi.fn())

vi.mock('posthog-js', () => ({ default: posthogMock }))
vi.mock('@vercel/analytics', () => ({ inject: injectMock }))

const memoryStorage = (): Storage => {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => {
      map.clear()
    },
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k)
    },
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
  }
}

const loadTelemetry = async () => {
  vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
  vi.resetModules()
  const store = await import('../stores/observability.store')
  const telemetry = await import('./telemetry')
  return { ...store, ...telemetry }
}

describe('telemetry consent gate', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage()
    posthogMock.has_opted_out_capturing.mockReturnValue(false)
    vi.clearAllMocks()
  })

  it('starts nothing while the store is off, key set or not', async () => {
    const { initTelemetry } = await loadTelemetry()
    initTelemetry()
    expect(posthogMock.init).not.toHaveBeenCalled()
    expect(injectMock).not.toHaveBeenCalled()
  })

  it('starts both beacons when consent is already stored', async () => {
    localStorage.setItem('canshift.tuner.observability', 'on')
    const { initTelemetry } = await loadTelemetry()
    initTelemetry()
    expect(posthogMock.init).toHaveBeenCalledTimes(1)
    expect(injectMock).toHaveBeenCalledTimes(1)
  })

  it('starts both beacons when the user opts in later', async () => {
    const { initTelemetry, useObservabilityStore } = await loadTelemetry()
    initTelemetry()
    useObservabilityStore.getState().setEnabled(true)
    expect(posthogMock.init).toHaveBeenCalledTimes(1)
    expect(injectMock).toHaveBeenCalledTimes(1)
  })

  it('opts capturing out again when the user opts back out', async () => {
    const { initTelemetry, useObservabilityStore } = await loadTelemetry()
    initTelemetry()
    useObservabilityStore.getState().setEnabled(true)
    useObservabilityStore.getState().setEnabled(false)
    expect(posthogMock.opt_out_capturing).toHaveBeenCalledTimes(1)
    expect(posthogMock.init).toHaveBeenCalledTimes(1)
  })

  it('drops web-analytics events while consent is off', async () => {
    const { initTelemetry, useObservabilityStore } = await loadTelemetry()
    initTelemetry()
    useObservabilityStore.getState().setEnabled(true)
    const beforeSend = injectMock.mock.calls[0]?.[0]?.beforeSend as (e: unknown) => unknown
    const event = { type: 'pageview', url: 'https://canshift.app/' }
    expect(beforeSend(event)).toBe(event)
    useObservabilityStore.getState().setEnabled(false)
    expect(beforeSend(event)).toBeNull()
  })
})
