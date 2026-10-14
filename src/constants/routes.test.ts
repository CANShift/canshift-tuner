import { describe, expect, it } from 'vitest'
import { HOME_PATH, LEGACY_REDIRECTS, ROUTE_META, ROUTE_PATHS } from './routes'
import { HEADER_TABS } from '../components/shell/HeaderView'

const RETIRED_PATHS = [
  '/',
  '/dashboard',
  '/can',
  '/ecu',
  '/obd2',
  '/themes',
  '/signals',
  '/live',
  '/logs',
  '/cli',
  '/board',
  '/firmware',
  '/flash',
  '/about',
  '/contact',
]

describe('the route map', () => {
  it('exposes exactly the three tabs', () => {
    expect([...ROUTE_PATHS]).toEqual(['/dash', '/vehicle', '/device'])
  })

  it('opens on the dash', () => {
    expect(ROUTE_PATHS).toContain(HOME_PATH)
    expect(LEGACY_REDIRECTS['/']).toBe(HOME_PATH)
  })

  it('gives every retired path a tab, so no bookmark 404s', () => {
    for (const path of RETIRED_PATHS) {
      const target = LEGACY_REDIRECTS[path]
      expect(target, `${path} has no redirect`).toBeDefined()
      expect(ROUTE_PATHS).toContain(target)
    }
  })

  it('sends signals and live values to the vehicle tab', () => {
    expect(LEGACY_REDIRECTS['/signals']).toBe('/vehicle')
    expect(LEGACY_REDIRECTS['/live']).toBe('/vehicle')
  })

  it('keeps the header tabs and the route map in agreement', () => {
    expect(HEADER_TABS.map((tab) => tab.to)).toEqual([...ROUTE_PATHS])
  })

  it('titles and describes every reachable view', () => {
    for (const path of ROUTE_PATHS) {
      expect(ROUTE_META[path].title.length).toBeGreaterThan(0)
      expect(ROUTE_META[path].description.length).toBeGreaterThan(0)
    }
  })
})
