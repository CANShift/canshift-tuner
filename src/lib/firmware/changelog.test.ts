import { describe, expect, it } from 'vitest'
import { parseChangelog } from './changelog'

describe('parseChangelog', () => {
  it('tags a bullet list by its conventional-commit type', () => {
    const notes = [
      '- feat: lap timer on the top bar',
      '- fix(can): three-byte values',
      '- chore: bump deps',
    ].join('\n')
    expect(parseChangelog(notes)).toEqual([
      { tag: 'ADD', text: 'lap timer on the top bar' },
      { tag: 'FIX', text: 'three-byte values' },
      { tag: 'CHG', text: 'bump deps' },
    ])
  })

  it('falls back to CHG for a bullet with no type prefix', () => {
    expect(parseChangelog('- the top bar follows the mockup')).toEqual([
      { tag: 'CHG', text: 'the top bar follows the mockup' },
    ])
  })

  it('reads prose release notes as one entry per section', () => {
    const notes = [
      'The release that stops the firmware being tied to one board.',
      '',
      '## BLE link',
      '',
      'Telemetry moved from JSON to a binary frame. Around it: a 247-byte MTU.',
      '',
      '## Fixes',
      '',
      'Cruise-control widgets keep per-instance state.',
    ].join('\n')
    expect(parseChangelog(notes)).toEqual([
      {
        tag: 'CHG',
        text: 'BLE link — Telemetry moved from JSON to a binary frame.',
      },
      { tag: 'FIX', text: 'Fixes — Cruise-control widgets keep per-instance state.' },
    ])
  })

  it('strips links and emphasis so a row stays one plain line', () => {
    expect(
      parseChangelog('- feat: flash with the [tuner](https://tuner.canshift.app) **only**')
    ).toEqual([{ tag: 'ADD', text: 'flash with the tuner only' }])
  })

  it('reads the CRLF line endings GitHub actually serves', () => {
    const notes = '## BLE link\r\n\r\nTelemetry moved to a binary frame.\r\n'
    expect(parseChangelog(notes)).toEqual([
      { tag: 'CHG', text: 'BLE link — Telemetry moved to a binary frame.' },
    ])
  })

  it('returns nothing for empty notes rather than an empty row', () => {
    expect(parseChangelog('')).toEqual([])
    expect(parseChangelog('\n\n')).toEqual([])
  })

  it('caps a very long release so the pane cannot be flooded', () => {
    const notes = Array.from({ length: 30 }, (_, i) => `- feat: change ${String(i)}`).join('\n')
    expect(parseChangelog(notes)).toHaveLength(12)
  })
})
