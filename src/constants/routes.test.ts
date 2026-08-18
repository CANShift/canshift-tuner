import { describe, expect, it } from 'vitest'
import { DEVICE_GATED_PATHS, HOME_PATHS, LEGACY_REDIRECTS, ROUTE_META, ROUTE_PATHS } from './routes'
import { HEADER_TABS } from '../components/shell/HeaderView'

const V1_PATHS = [
  '/dashboard',
  '/can',
  '/ecu',
  '/obd2',
  '/themes',
  '/live',
  '/logs',
  '/cli',
  '/board',
  '/firmware',
  '/about',
]

describe('the v2 route map', () => {
  it('exposes five views and three home panes', () => {
    expect(ROUTE_PATHS).toHaveLength(7)
    expect(HOME_PATHS.size).toBe(3)
  })

  it('gives every v1 path a home, so no bookmark 404s', () => {
    for (const path of V1_PATHS) {
      if (path === '/live') {
        expect(ROUTE_PATHS).toContain(path)
        continue
      }
      const target = LEGACY_REDIRECTS[path]
      expect(target, `${path} has no redirect`).toBeDefined()
      expect(ROUTE_PATHS).toContain(target)
    }
  })

  it('redirects the removed logs view to live, where recording lands', () => {
    expect(LEGACY_REDIRECTS['/logs']).toBe('/live')
  })

  it('gates every view that needs a board, and never home', () => {
    expect([...DEVICE_GATED_PATHS].sort()).toEqual(['/dash', '/device', '/live', '/signals'])
    for (const path of HOME_PATHS) {
      expect(DEVICE_GATED_PATHS.has(path)).toBe(false)
    }
  })

  it('keeps the header tabs and the gate in agreement', () => {
    for (const tab of HEADER_TABS) {
      expect(tab.gated).toBe(DEVICE_GATED_PATHS.has(tab.to))
      expect(ROUTE_META[tab.to]).toBeDefined()
    }
  })

  it('titles and describes every reachable view', () => {
    for (const path of ROUTE_PATHS) {
      expect(ROUTE_META[path].title.length).toBeGreaterThan(0)
      expect(ROUTE_META[path].description.length).toBeGreaterThan(0)
    }
  })
})
