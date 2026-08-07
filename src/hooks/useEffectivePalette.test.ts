import { describe, it, expect } from 'vitest'
import type { PagePalette } from '@canshift/core'
import { DEFAULT_PAGE_PALETTE } from '@canshift/core'
import { DAY_PALETTE_DEFAULT, DAY_BG_DEFAULT } from '../constants/theme'
import { resolveBgColor, resolvePalette } from './useEffectivePalette'

const day = { accent: '#111111' } as unknown as PagePalette
const night = { accent: '#222222' } as unknown as PagePalette
const pagePalette = { accent: '#333333' } as unknown as PagePalette

describe('resolvePalette', () => {
  it('prefers the day palette in day mode, falling back to the day default', () => {
    expect(resolvePalette(true, day, night, pagePalette)).toBe(day)
    expect(resolvePalette(true, undefined, night, pagePalette)).toBe(DAY_PALETTE_DEFAULT)
  })

  it('prefers night then page then the shared default in night mode', () => {
    expect(resolvePalette(false, day, night, pagePalette)).toBe(night)
    expect(resolvePalette(false, day, undefined, pagePalette)).toBe(pagePalette)
    expect(resolvePalette(false, day, undefined, undefined)).toBe(DEFAULT_PAGE_PALETTE)
  })
})

describe('resolveBgColor', () => {
  it('prefers the day bg in day mode, falling back to the day default', () => {
    expect(resolveBgColor(true, '#aaa', '#bbb', '#ccc')).toBe('#aaa')
    expect(resolveBgColor(true, undefined, '#bbb', '#ccc')).toBe(DAY_BG_DEFAULT)
  })

  it('prefers night then the page bg in night mode', () => {
    expect(resolveBgColor(false, '#aaa', '#bbb', '#ccc')).toBe('#bbb')
    expect(resolveBgColor(false, '#aaa', undefined, '#ccc')).toBe('#ccc')
  })
})
