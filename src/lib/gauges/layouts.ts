import type { PageConfig } from '@canshift/core'
import { FIRMWARE_CAPS } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { createId } from '../../utils/id'
import { autoPlace, type SpanSize } from '../../utils/layout'
import { pageName } from '../sync/describe'

export interface StartingLayout {
  id: string
  name: string
  gaugeCount: number
  page: PageConfig
}

export const STARTING_LAYOUTS: readonly StartingLayout[] = DEFAULT_SIM_CONFIG.pages.map((page) => ({
  id: page.id,
  name: pageName(page),
  gaugeCount: page.widgets.length,
  page,
}))

const FIRST_SUFFIX = 2

export const nextPageId = (base: string, taken: ReadonlySet<string>): string => {
  if (!taken.has(base)) return base
  let suffix = FIRST_SUFFIX
  while (taken.has(`${base}_${String(suffix)}`)) suffix += 1
  return `${base}_${String(suffix)}`
}

export const pageFromLayout = (layout: StartingLayout, taken: ReadonlySet<string>): PageConfig => ({
  ...structuredClone(layout.page),
  id: nextPageId(layout.page.id, taken),
  widgets: layout.page.widgets.map((widget) => ({
    ...structuredClone(widget),
    id: createId(widget.type),
  })),
})

export const canAddPage = (pages: readonly PageConfig[]): boolean =>
  pages.length < FIRMWARE_CAPS.MAX_PAGES

const FALLBACK_SIZES: readonly SpanSize[] = [
  { colSpan: 6, rowSpan: 3 },
  { colSpan: 4, rowSpan: 3 },
  { colSpan: 3, rowSpan: 3 },
  { colSpan: 3, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
]

export interface FreePlace {
  col: number
  row: number
  colSpan: number
  rowSpan: number
}

export const freePlaceFor = (page: PageConfig, preferred?: SpanSize): FreePlace | null => {
  const taken = page.widgets.map((widget) => widget.layout)
  const sizes = preferred === undefined ? FALLBACK_SIZES : [preferred, ...FALLBACK_SIZES]
  for (const size of sizes) {
    const spot = autoPlace(size, taken)
    if (spot !== null) return { ...spot, ...size }
  }
  return null
}

export const canAddGauge = (page: PageConfig): boolean =>
  page.widgets.length < FIRMWARE_CAPS.MAX_WIDGETS_PER_PAGE && freePlaceFor(page) !== null
