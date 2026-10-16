import { describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { DEFAULT_SIM_SIGNALS } from '../../config/default-sim-signals'
import { backupFileName, readBackup, serializeBackup } from './backup'

const NOW = new Date('2026-10-02T09:30:00Z')
const contents = {
  dashboard: DEFAULT_SIM_CONFIG,
  ecuProfileKey: 'demo:canshift',
  signals: DEFAULT_SIM_SIGNALS,
}

describe('backup files', () => {
  it('names the file after the day it was saved', () => {
    expect(backupFileName(NOW)).toBe('canshift-backup-2026-10-02.canshift')
  })

  it('reads back the pages, the car and the save date', () => {
    const read = readBackup('mine.canshift', serializeBackup(contents, NOW))
    if (read.kind !== 'ok') throw new Error('expected a readable backup')
    expect(read.summary).toEqual({
      fileName: 'mine.canshift',
      savedAt: NOW,
      car: 'CANShift demo',
      pages: DEFAULT_SIM_CONFIG.pages.length,
    })
    expect(read.contents.signals).toHaveLength(DEFAULT_SIM_SIGNALS.length)
  })

  it('refuses a file that is not a backup', () => {
    expect(readBackup('x.json', '{"hello":1}')).toEqual({ kind: 'invalid' })
    expect(readBackup('x.json', 'not json')).toEqual({ kind: 'invalid' })
  })
})
