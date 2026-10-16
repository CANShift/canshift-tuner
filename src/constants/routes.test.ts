import { describe, expect, it } from 'vitest'
import { HOME_PATH, LEGACY_REDIRECTS, ROUTE_META, ROUTE_PATHS } from './routes'
import { SECTIONS } from '../components/chrome/sections'

const RETIRED_PATHS = [
  '/',
  '/vehicle',
  '/device',
  '/dashboard',
  '/can',
  '/ecu',
  '/obd2',
  '/themes',
  '/signals',
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
    expect([...ROUTE_PATHS]).toEqual(['/gauges', '/car', '/dash'])
  })

  it('opens on the gauges', () => {
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

  it('sends signals to the car section', () => {
    expect(LEGACY_REDIRECTS['/signals']).toBe('/car')
  })

  it('keeps the section nav and the route map in agreement', () => {
    expect(SECTIONS.map((section) => section.path)).toEqual([...ROUTE_PATHS])
  })

  it('titles and describes every reachable view', () => {
    for (const path of ROUTE_PATHS) {
      expect(ROUTE_META[path].title.length).toBeGreaterThan(0)
      expect(ROUTE_META[path].description.length).toBeGreaterThan(0)
    }
  })
})
