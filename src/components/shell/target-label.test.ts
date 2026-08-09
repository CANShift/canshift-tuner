import { describe, expect, it } from 'vitest'
import { resolveTargetLabel } from './target-label'

describe('sidebar TARGET label', () => {
  it('is blank while offline, even when the config names a profile', () => {
    expect(resolveTargetLabel(true, 'crowpanel-28')).toBeNull()
  })

  it('is blank when connected but the config names no profile', () => {
    expect(resolveTargetLabel(false, undefined)).toBeNull()
  })

  it('names the profile when connected and the config sets one', () => {
    expect(resolveTargetLabel(false, 'crowpanel-28')).toBe('CrowPanel 2.8"')
  })
})
