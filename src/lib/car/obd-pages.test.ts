import { describe, expect, it } from 'vitest'
import { pageListText, pagesText } from './obd-pages'

describe('obd page list', () => {
  it('collapses three or more consecutive pages into a range', () => {
    expect(pageListText([3, 1, 2])).toBe('1–3')
    expect(pageListText([1, 2, 6])).toBe('1, 2, 6')
    expect(pageListText([1, 2, 3, 5, 6, 7, 9])).toBe('1–3, 5–7, 9')
  })

  it('ignores repeated pages', () => {
    expect(pageListText([4, 4])).toBe('4')
  })

  it('words the pages a signal is shown on', () => {
    expect(pagesText([])).toBe('not on any page')
    expect(pagesText([4])).toBe('on page 4')
    expect(pagesText([1, 2, 3])).toBe('on pages 1–3')
  })
})
