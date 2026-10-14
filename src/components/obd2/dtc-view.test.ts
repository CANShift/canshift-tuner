import { describe, expect, it } from 'vitest'
import { dtcView } from './DtcPanel'

const base = { ready: true, reading: false, hasRead: true, codes: ['P0301'] }

describe('dtcView', () => {
  it('walks from no link to listed codes', () => {
    expect(dtcView({ ...base, ready: false })).toBe('unready')
    expect(dtcView({ ...base, reading: true })).toBe('reading')
    expect(dtcView({ ...base, hasRead: false })).toBe('unread')
    expect(dtcView({ ...base, codes: [] })).toBe('empty')
    expect(dtcView(base)).toBe('codes')
  })
})
