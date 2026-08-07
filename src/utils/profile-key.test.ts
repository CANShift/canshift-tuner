import { describe, it, expect } from 'vitest'
import { prettyProfileKey } from './profile-key'

describe('prettyProfileKey', () => {
  it('drops the namespace prefix and humanizes separators', () => {
    expect(prettyProfileKey('builtin:maxx-ecu')).toBe('maxx ecu')
    expect(prettyProfileKey('user:my_custom_profile')).toBe('my custom profile')
  })

  it('handles a key with no namespace', () => {
    expect(prettyProfileKey('haltech_elite')).toBe('haltech elite')
  })
})
