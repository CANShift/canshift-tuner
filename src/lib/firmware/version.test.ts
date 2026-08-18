import { describe, expect, it } from 'vitest'
import { isNewerVersion } from './version'

describe('isNewerVersion', () => {
  it('compares numerically, not lexically', () => {
    expect(isNewerVersion('0.1.10', '0.1.9')).toBe(true)
    expect(isNewerVersion('0.1.9', '0.1.10')).toBe(false)
  })

  it('walks the components left to right', () => {
    expect(isNewerVersion('1.0.0', '0.9.9')).toBe(true)
    expect(isNewerVersion('0.2.0', '0.1.99')).toBe(true)
  })

  it('is false for the same version', () => {
    expect(isNewerVersion('0.1.1', '0.1.1')).toBe(false)
  })

  it('tolerates a v prefix and a shorter version', () => {
    expect(isNewerVersion('v0.2', '0.1.9')).toBe(true)
    expect(isNewerVersion('0.1', '0.1.0')).toBe(false)
  })

  it('ignores a prerelease suffix rather than guessing at it', () => {
    expect(isNewerVersion('0.2.0-rc1', '0.1.9')).toBe(true)
    expect(isNewerVersion('0.1.9-rc1', '0.1.9')).toBe(false)
  })

  it('never claims an update when either side is unreadable', () => {
    expect(isNewerVersion('', '0.1.0')).toBe(false)
    expect(isNewerVersion('0.2.0', '')).toBe(false)
    expect(isNewerVersion('latest', '0.1.0')).toBe(false)
  })
})
