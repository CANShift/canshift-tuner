import type { DashboardConfig, Project, ProjectMeta } from '@canshift/core'
import { resolveScreenProfile } from '@canshift/core'

export interface BenchEntry {
  id: string
  name: string
  meta: string
  updatedAt: string
}

export const benchEntryFrom = (
  project: Project,
  meta: ProjectMeta,
  ecuLabel: string
): BenchEntry => {
  const dashboard = project.dashboard as DashboardConfig
  const panel = resolveScreenProfile(dashboard.targetProfile).name
  const pages = dashboard.pages.length
  return {
    id: meta.id,
    name: meta.name,
    meta: `${ecuLabel} · ${panel} · ${String(pages)} page${pages === 1 ? '' : 's'}`,
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
