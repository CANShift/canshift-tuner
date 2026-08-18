import type { DashboardConfig, Project, ProjectMeta } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { benchEntryFrom, formatRelativeDate } from './bench-entry'

const NOW = Date.parse('2026-08-12T12:00:00Z')
const ago = (ms: number): string => new Date(NOW - ms).toISOString()
const DAY = 86_400_000

const projectWith = (pages: number, targetProfile?: string): Project =>
  ({
    dashboard: {
      pages: Array.from({ length: pages }, (_, i) => ({ id: `page-${String(i)}` })),
      ...(targetProfile === undefined ? {} : { targetProfile }),
    } as unknown as DashboardConfig,
    signals: [],
  }) as unknown as Project

const metaFor = (name: string): ProjectMeta =>
  ({ id: 'p1', name, updatedAt: ago(0) }) as unknown as ProjectMeta

describe('formatRelativeDate', () => {
  it('collapses anything under an hour to "just now"', () => {
    expect(formatRelativeDate(ago(59 * 60_000), NOW)).toBe('just now')
  })

  it('separates today from yesterday at the day boundary', () => {
    expect(formatRelativeDate(ago(23 * 3_600_000), NOW)).toBe('today')
    expect(formatRelativeDate(ago(DAY), NOW)).toBe('yesterday')
  })

  it('counts days up to a month, then months', () => {
    expect(formatRelativeDate(ago(4 * DAY), NOW)).toBe('4 days ago')
    expect(formatRelativeDate(ago(45 * DAY), NOW)).toBe('last month')
    expect(formatRelativeDate(ago(200 * DAY), NOW)).toBe('6 months ago')
    expect(formatRelativeDate(ago(400 * DAY), NOW)).toBe('over a year ago')
  })

  it('never reports a future timestamp as negative', () => {
    expect(formatRelativeDate(new Date(NOW + DAY).toISOString(), NOW)).toBe('just now')
  })

  it('degrades on an unparseable timestamp instead of printing NaN', () => {
    expect(formatRelativeDate('not-a-date', NOW)).toBe('—')
  })
})

describe('benchEntryFrom', () => {
  it('reads as ECU, panel, page count — the three facts the row shows', () => {
    const entry = benchEntryFrom(projectWith(6, 'crowpanel-28'), metaFor('Track'), 'MaxxECU')
    expect(entry.meta).toBe('MaxxECU \u00b7 CrowPanel 2.8" \u00b7 6 pages')
  })

  it('singularises a one-page config', () => {
    const entry = benchEntryFrom(projectWith(1, 'crowpanel-28'), metaFor('Blank'), 'MaxxECU')
    expect(entry.meta).toContain('1 page')
    expect(entry.meta).not.toContain('1 pages')
  })

  it('names the default panel rather than leaving a gap when none is stored', () => {
    const entry = benchEntryFrom(projectWith(2), metaFor('Old'), 'MaxxECU')
    expect(entry.meta).toContain('CrowPanel 2.8"')
  })
})
