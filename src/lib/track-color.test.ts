import { describe, expect, it } from 'vitest'
import { trackColorFor } from './track-color'

describe('trackColorFor', () => {
  it('picks a dark track on a dark ground and a light one on a light ground', () => {
    expect(trackColorFor('#0D0D0D')).toBe('#222222')
    expect(trackColorFor('#F2F2F2')).toBe('#C4C4C4')
  })

  it('treats a malformed colour as dark', () => {
    expect(trackColorFor('red')).toBe('#222222')
  })
})
