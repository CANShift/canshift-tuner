import { describe, expect, it } from 'vitest'
import { provisionOutcome } from './provision-outcome'

describe('provisionOutcome', () => {
  it('reports a save, and whether the dash reboots', () => {
    expect(provisionOutcome({ kind: 'ok', restart: true }, 'b')).toMatchObject({
      state: { kind: 'ok', restart: true },
      level: 'success',
      log: 'Board profile saved — the dash is rebooting to apply it',
    })
    expect(provisionOutcome({ kind: 'ok', restart: false }, 'b').log).toBe('Board profile saved')
  })

  it('names the board the build does not know', () => {
    expect(provisionOutcome({ kind: 'unknown-board' }, 'crowpanel_50').log).toContain(
      'crowpanel_50'
    )
  })

  it('humanises a transport error', () => {
    const outcome = provisionOutcome({ kind: 'error', error: 'ack_timeout' }, 'b')
    expect(outcome.state.kind).toBe('error')
    expect(outcome.log).not.toContain('ack_timeout')
  })
})
