import { describe, expect, it } from 'vitest'
import { flashProgress } from './flash-steps'

const flashing = (written: number, total: number) => ({ kind: 'flashing' as const, written, total })

const running = (state: Parameters<typeof flashProgress>[0], elapsed: number): string | null =>
  flashProgress(state, elapsed).running?.id ?? null

describe('flashProgress', () => {
  it('leaves every step pending before a flash starts', () => {
    const progress = flashProgress({ kind: 'idle' }, 0)
    expect(progress.percent).toBe(0)
    expect(progress.steps.map((step) => step.status)).toEqual([
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
    ])
  })

  it('advances on elapsed time alone while the handshake reports no bytes', () => {
    const early = flashProgress(flashing(0, 1000), 500).percent
    const later = flashProgress(flashing(0, 1000), 5000).percent
    expect(later).toBeGreaterThan(early)
    expect(running(flashing(0, 1000), 500)).toBe('connect')
    expect(running(flashing(0, 1000), 8000)).toBe('check-model')
  })

  it('never lets the handshake reach the write band on time alone', () => {
    expect(flashProgress(flashing(0, 1000), 10 * 60 * 1000).percent).toBeLessThan(12)
  })

  it('tracks written bytes once the write is under way', () => {
    expect(flashProgress(flashing(500, 1000), 0).percent).toBe(50)
    expect(running(flashing(500, 1000), 0)).toBe('write')
  })

  it('keeps moving after the last byte so a remount cannot freeze the bar', () => {
    const atLastByte = flashProgress(flashing(1000, 1000), 0).percent
    const settling = flashProgress(flashing(1000, 1000), 5000).percent
    expect(atLastByte).toBe(88)
    expect(settling).toBeGreaterThan(atLastByte)
    expect(running(flashing(1000, 1000), 0)).toBe('verify')
    expect(running(flashing(1000, 1000), 6000)).toBe('reboot')
  })

  it('stops short of 100 until the flasher itself reports success', () => {
    expect(flashProgress(flashing(1000, 1000), 10 * 60 * 1000).percent).toBeLessThan(100)
    expect(flashProgress({ kind: 'success' }, 0).percent).toBe(100)
  })

  it('marks every step done on success', () => {
    const progress = flashProgress({ kind: 'success' }, 0)
    expect(progress.steps.every((step) => step.status === 'done')).toBe(true)
    expect(progress.running).toBeNull()
  })
})
