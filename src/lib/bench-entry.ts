import type { DashboardConfig, PageConfig, Project, ProjectMeta } from '@canshift/core'
import { displayLabelForSignal } from '../utils/signal-labels'

export type BenchTheme = 'day' | 'night'

export interface BenchEntry {
  id: string
  name: string
  ecuLabel: string
  signalCount: number
  pageCount: number
  theme: BenchTheme
  kicker: string
  updatedAt: string
}

const NIGHT_LUMINANCE_MAX = 0.5
const VALUE_WIDGET_TYPES = new Set(['gauge', 'gear', 'timer'])

const relativeLuminance = (hex: string): number => {
  const value = hex.replace('#', '')
  if (value.length !== 6) return 0
  const channel = (offset: number): number => parseInt(value.slice(offset, offset + 2), 16) / 255
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

const defaultPage = (dashboard: DashboardConfig): PageConfig | null => {
  const match = dashboard.pages.find((page) => page.id === dashboard.defaultPageId)
  return match ?? dashboard.pages[0] ?? null
}

const themeOf = (page: PageConfig | null): BenchTheme => {
  if (!page) return 'night'
  return relativeLuminance(page.backgroundColor) > NIGHT_LUMINANCE_MAX ? 'day' : 'night'
}

const kickerOf = (page: PageConfig | null): string => {
  if (!page) return '—'
  const widget = page.widgets.find(
    (candidate) => VALUE_WIDGET_TYPES.has(candidate.type) && candidate.signal !== ''
  )
  if (!widget) return page.id.toUpperCase()
  return displayLabelForSignal(widget.signal).toUpperCase()
}

export interface BenchPreview {
  theme: BenchTheme
  kicker: string
}

export const benchPreviewOfPage = (page: PageConfig | null): BenchPreview => ({
  theme: themeOf(page),
  kicker: kickerOf(page),
})

export const benchEntryFrom = (
  project: Project,
  meta: ProjectMeta,
  ecuLabel: string
): BenchEntry => {
  const dashboard = project.dashboard as DashboardConfig
  const preview = benchPreviewOfPage(defaultPage(dashboard))
  return {
    id: meta.id,
    name: meta.name,
    ecuLabel,
    signalCount: project.signals.length,
    pageCount: dashboard.pages.length,
    theme: preview.theme,
    kicker: preview.kicker,
    updatedAt: meta.updatedAt,
  }
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const MONTH_DAYS = 30
const YEAR_DAYS = 365

export const formatRelativeDate = (iso: string, now: number): string => {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return '—'
  const elapsed = Math.max(0, now - then)
  if (elapsed < HOUR_MS) return 'just now'
  if (elapsed < DAY_MS) return 'today'
  const days = Math.floor(elapsed / DAY_MS)
  if (days === 1) return 'yesterday'
  if (days < MONTH_DAYS) return `${String(days)} days ago`
  if (days < YEAR_DAYS) return relativeMonths(days)
  return 'over a year ago'
}

const relativeMonths = (days: number): string => {
  const months = Math.floor(days / MONTH_DAYS)
  return months === 1 ? 'last month' : `${String(months)} months ago`
}
