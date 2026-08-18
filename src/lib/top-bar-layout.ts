import type { PageStatusRow, TopBarItem } from '@canshift/core'

type OverridablePosition = 'center' | 'right'

const OVERRIDABLE: readonly OverridablePosition[] = ['center', 'right']

export const mergePageStatusRow = (
  layout: readonly TopBarItem[],
  statusRow: PageStatusRow | undefined
): readonly TopBarItem[] => {
  if (!statusRow) return layout
  const overrides = OVERRIDABLE.map((position) => statusRow[position]).filter(
    (item): item is TopBarItem => item !== undefined
  )
  if (overrides.length === 0) return layout
  const taken = new Set(OVERRIDABLE.filter((position) => statusRow[position] !== undefined))
  const kept = layout.filter((item) => !taken.has(item.position as OverridablePosition))
  return [...kept, ...overrides]
}
