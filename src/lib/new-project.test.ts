import { describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../config/default-sim-config'
import { BLANK_PAGE_SET, PAGE_SET_OPTIONS, buildNewProjectDashboard } from './new-project'

describe('buildNewProjectDashboard', () => {
  it('exposes the six default page sets', () => {
    expect(PAGE_SET_OPTIONS).toHaveLength(6)
  })

  it('blank starting point yields a single empty page', () => {
    const dashboard = buildNewProjectDashboard({
      name: 'Empty',
      targetProfile: 'crowpanel-28',
      pageSetId: BLANK_PAGE_SET,
    })
    expect(dashboard.pages).toHaveLength(1)
    expect(dashboard.pages[0]?.widgets).toHaveLength(0)
    expect(dashboard.defaultPageId).toBe(dashboard.pages[0]?.id)
    expect(dashboard.name).toBe('Empty')
    expect(dashboard.targetProfile).toBe('crowpanel-28')
  })

  it('a page set yields a single page carrying that set’s widgets', () => {
    const option = PAGE_SET_OPTIONS[0]
    expect(option).toBeDefined()
    if (!option) return
    const source = DEFAULT_SIM_CONFIG.pages.find((p) => p.id === option.id)

    const dashboard = buildNewProjectDashboard({
      name: 'From set',
      targetProfile: 'crowpanel-28',
      pageSetId: option.id,
    })
    expect(dashboard.pages).toHaveLength(1)
    expect(dashboard.pages[0]?.id).toBe(option.id)
    expect(dashboard.pages[0]?.widgets.length).toBe(source?.widgets.length)
    expect(dashboard.defaultPageId).toBe(option.id)
  })
})
