import { describe, expect, it } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { compareDash } from './compare-dash'

const named = (name: string): DashboardConfig => ({ ...DEFAULT_SIM_CONFIG, name })

const synced = named('Synced')
const edited = named('Edited here')
const changedOnDash = named('Edited on the dash')

describe('comparing the dash with the open setup', () => {
  it('finds them identical when the dash holds the open setup', () => {
    expect(compareDash(edited, structuredClone(edited), synced)).toBe('identical')
  })

  it('finds the project newer when only this browser changed since the last sync', () => {
    expect(compareDash(structuredClone(synced), edited, synced)).toBe('projectNewer')
  })

  it('finds the device newer when only the dash changed since the last sync', () => {
    expect(compareDash(changedOnDash, structuredClone(synced), synced)).toBe('deviceNewer')
  })

  it('finds a different project when both changed since the last sync', () => {
    expect(compareDash(changedOnDash, edited, synced)).toBe('differentProject')
  })

  it('finds a different project when this browser never synced and holds its own edits', () => {
    expect(compareDash(changedOnDash, edited, null)).toBe('differentProject')
  })

  it('treats the untouched demo setup as older than any dash setup', () => {
    expect(compareDash(changedOnDash, DEFAULT_SIM_CONFIG, null)).toBe('deviceNewer')
  })

  it('reports an empty dash when it holds no setup', () => {
    expect(compareDash(null, edited, synced)).toBe('deviceEmpty')
  })
})
