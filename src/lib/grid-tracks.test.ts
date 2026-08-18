import { describe, expect, it } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import { DISPLAY_TIERS } from '@canshift/core'
import { gridTracksForConfig, gridTracksForProfile } from './grid-tracks'

describe('gridTracksForProfile', () => {
  it('resolves every catalogued panel through the tier rule, not a constant', () => {
    const tracks = gridTracksForProfile(undefined)
    expect(tracks.columns).toBe(DISPLAY_TIERS.base.columns)
    expect(tracks.rows).toBe(DISPLAY_TIERS.base.rows)
  })

  it('gives a config with no target profile the same grid as the default panel', () => {
    expect(gridTracksForConfig(null)).toEqual(gridTracksForProfile(undefined))
    expect(gridTracksForConfig({ pages: [] } as unknown as DashboardConfig)).toEqual(
      gridTracksForProfile(undefined)
    )
  })
})
