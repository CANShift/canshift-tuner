import { describe, expect, it } from 'vitest'
import { DISPLAY_TIER_LIST, tierForPanel } from '@canshift/core'

describe('tierForPanel, the rule the preview shares with the device', () => {
  it('resolves every catalogued panel to a tier that fits inside it', () => {
    for (const tier of DISPLAY_TIER_LIST) {
      const resolved = tierForPanel(tier.designWidth, tier.designHeight)
      expect(resolved.designWidth).toBeLessThanOrEqual(tier.designWidth)
      expect(resolved.designHeight).toBeLessThanOrEqual(tier.designHeight)
    }
  })

  it('never returns a tier larger than the panel', () => {
    expect(tierForPanel(479, 319).id).toBe('base')
    expect(tierForPanel(320, 240).id).toBe('base')
  })

  it('caps widgets per page by tier, not by a flat constant', () => {
    const caps = DISPLAY_TIER_LIST.map((tier) => tier.maxWidgetsPerPage)
    expect(new Set(caps).size).toBeGreaterThan(1)
    expect(tierForPanel(320, 240).maxWidgetsPerPage).toBe(12)
  })
})
