import { describe, expect, it, vi } from 'vitest'
import { bestEffort } from './best-effort'

describe('bestEffort', () => {
  it('runs the operation and reports nothing when it succeeds', async () => {
    const report = vi.fn()
    const op = vi.fn(() => Promise.resolve('done'))

    await bestEffort('thing', op, report)

    expect(op).toHaveBeenCalledTimes(1)
    expect(report).not.toHaveBeenCalled()
  })

  it('never rejects, and hands the failure to the injected channel', async () => {
    const report = vi.fn()
    const boom = new Error('port busy')

    await expect(
      bestEffort('transport.disconnect', () => Promise.reject(boom), report)
    ).resolves.toBeUndefined()

    expect(report).toHaveBeenCalledWith('transport.disconnect failed — continuing', boom)
  })

  it('catches a synchronous throw too', async () => {
    const report = vi.fn()

    await bestEffort(
      'releaseLock',
      () => {
        throw new TypeError('locked')
      },
      report
    )

    expect(report).toHaveBeenCalledTimes(1)
  })

  it('falls back to console.warn when no channel is given', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await bestEffort('unrouted', () => Promise.reject(new Error('x')))

    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})
