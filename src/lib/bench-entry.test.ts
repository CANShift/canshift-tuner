import type { PageConfig, Widget } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { benchPreviewOfPage, formatRelativeDate } from './bench-entry'

const NOW = Date.parse('2026-08-12T12:00:00Z')
const ago = (ms: number): string => new Date(NOW - ms).toISOString()
const DAY = 86_400_000

const widget = (type: string, signal: string): Widget =>
  ({ id: `${type}-1`, type, signal, layout: {}, style: {}, config: { type } }) as unknown as Widget

const page = (backgroundColor: string, widgets: Widget[], id = 'street'): PageConfig =>
  ({ id, backgroundColor, widgets }) as unknown as PageConfig

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

describe('benchPreviewOfPage', () => {
  it('reads the theme from the page ground, not from a stored flag', () => {
    expect(benchPreviewOfPage(page('#121212', [])).theme).toBe('night')
    expect(benchPreviewOfPage(page('#DDDDDD', [])).theme).toBe('day')
  })

  it('takes the kicker from the first bound value widget', () => {
    const preview = benchPreviewOfPage(
      page('#121212', [widget('button', 'flag_mil'), widget('gauge', 'speed_kph')])
    )
    expect(preview.kicker).toBe('SPEED')
  })

  it('skips a value widget that is bound to nothing', () => {
    const preview = benchPreviewOfPage(
      page('#121212', [widget('gauge', ''), widget('gauge', 'rpm')])
    )
    expect(preview.kicker).toBe('RPM')
  })

  it('falls back to the page name when a page carries no value widget', () => {
    const preview = benchPreviewOfPage(page('#121212', [widget('button', 'flag_mil')], 'controls'))
    expect(preview.kicker).toBe('CONTROLS')
  })
})
