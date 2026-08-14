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

  it('prefers what the board reports over what the config was drawn for', () => {
    expect(resolveTargetLabel(false, 'crowpanel-28', 'waveshare_s3_28')).toBe('waveshare_s3_28')
  })

  it('falls back to the config profile when the board reports no id', () => {
    expect(resolveTargetLabel(false, 'crowpanel-28', null)).toBe('CrowPanel 2.8"')
  })

  it('stays blank offline even when a board id is remembered', () => {
    expect(resolveTargetLabel(true, 'crowpanel-28', 'waveshare_s3_28')).toBeNull()
  })
})
