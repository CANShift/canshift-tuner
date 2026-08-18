import { describe, expect, it } from 'vitest'
import { buildContactReport } from './contact-report'

const base = {
  kind: 'bug' as const,
  email: 'driver@example.com',
  message: 'gauge flickers on reconnect',
  context: {
    appVersion: '0.1.0',
    firmwareVersion: '0.1.1',
    ecuProfile: 'MegaSquirt MS3',
    pageCount: 6,
    simulation: false,
  },
  configJson: '{"pages":[]}',
}

describe('buildContactReport', () => {
  it('is readable on its own — the fallback when the endpoint is unreachable', () => {
    const report = buildContactReport(base)
    expect(report).toContain('CANShift Tuner — Bug report')
    expect(report).toContain('driver@example.com')
    expect(report).toContain('Firmware: 0.1.1')
    expect(report).toContain('ECU profile: MegaSquirt MS3')
    expect(report).toContain('gauge flickers on reconnect')
    expect(report).toContain('{"pages":[]}')
  })

  it('says the context was removed rather than printing an empty block', () => {
    expect(buildContactReport({ ...base, context: null })).toContain('(removed by the reporter)')
  })

  it('prints false, not nothing, for a boolean that is off', () => {
    expect(buildContactReport(base)).toContain('Simulation: false')
  })

  it('skips a context field that has no value instead of printing undefined', () => {
    const report = buildContactReport({ ...base, context: { appVersion: '0.1.0' } })
    expect(report).not.toContain('undefined')
    expect(report).not.toContain('Firmware:')
  })

  it('states when no config was attached', () => {
    expect(buildContactReport({ ...base, configJson: null })).toContain('(not attached)')
  })

  it('names the kind so an ECU request is not filed as a bug', () => {
    expect(buildContactReport({ ...base, kind: 'ecu-request' })).toContain('ECU profile request')
  })
})
