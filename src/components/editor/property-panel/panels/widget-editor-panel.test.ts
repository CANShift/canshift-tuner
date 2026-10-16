import { describe, expect, it } from 'vitest'
import type { Widget } from '@canshift/core'
import { dayModeStyle } from './widget-editor-panel'

describe('dayModeStyle', () => {
  it('drops the override to follow day mode and pins it otherwise', () => {
    const style = { respectDayMode: false, textColor: '#FFFFFF' } as Widget['style']
    expect(dayModeStyle(style, true)).toEqual({ textColor: '#FFFFFF' })
    expect(dayModeStyle(style, false)).toEqual({ textColor: '#FFFFFF', respectDayMode: false })
  })
})
