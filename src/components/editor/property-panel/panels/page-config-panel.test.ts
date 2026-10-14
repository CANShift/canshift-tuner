import { describe, expect, it } from 'vitest'
import { FIRMWARE_CAPS, type DashboardConfig } from '@canshift/core'
import { cruiseToggle } from './page-config-panel'

const config = (count: number, cruise = false) =>
  ({
    pages: Array.from({ length: count }, (_, i) => ({
      id: `p${String(i)}`,
      template: cruise && i === 0 ? 'cruise_control' : 'custom',
    })),
  }) as unknown as DashboardConfig

describe('cruiseToggle', () => {
  it('adds the page when there is room and removes it when unticked', () => {
    expect(cruiseToggle(config(2), true)).toBe('add')
    expect(cruiseToggle(config(2, true), false)).toBe('remove')
  })

  it('reports the page cap instead of adding', () => {
    expect(cruiseToggle(config(FIRMWARE_CAPS.MAX_PAGES), true)).toBe('over-cap')
  })

  it('does nothing when the state already matches', () => {
    expect(cruiseToggle(config(2, true), true)).toBe('none')
    expect(cruiseToggle(config(2), false)).toBe('none')
  })
})
