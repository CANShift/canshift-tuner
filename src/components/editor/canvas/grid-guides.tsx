import { useMemo } from 'react'
import { LAYOUT_GRID, resolveGridRect } from '@canshift/core'

export interface GridGuidesProps {
  areaWidth: number
  areaHeight: number
  effScale: number
}

const VERTICAL_GUIDE = 'absolute bottom-0 top-0 w-px bg-[#FFFFFF0A]'

const HORIZONTAL_GUIDE = 'absolute left-0 right-0 h-px bg-[#FFFFFF0A]'

export const GridGuides = ({ areaWidth, areaHeight, effScale }: GridGuidesProps) => {
  const guides = useMemo(() => {
    const area = { width: areaWidth, height: areaHeight }
    const verticals: number[] = []
    for (let c = 0; c < LAYOUT_GRID.COLUMNS; c++) {
      const r = resolveGridRect({ col: c, colSpan: 1, row: 0, rowSpan: 1 }, area)
      verticals.push(r.x, r.x + r.w)
    }
    const horizontals: number[] = []
    for (let r = 0; r < LAYOUT_GRID.ROWS; r++) {
      const rect = resolveGridRect({ col: 0, colSpan: 1, row: r, rowSpan: 1 }, area)
      horizontals.push(rect.y, rect.y + rect.h)
    }
    return { verticals, horizontals }
  }, [areaWidth, areaHeight])

  return (
    <div className="pointer-events-none absolute inset-0">
      {guides.verticals.map((x, i) => (
        // eslint-disable-next-line no-inline-style/no-inline-style
        <div key={`v${String(i)}`} className={VERTICAL_GUIDE} style={{ left: x * effScale }} />
      ))}
      {guides.horizontals.map((y, i) => (
        // eslint-disable-next-line no-inline-style/no-inline-style
        <div key={`h${String(i)}`} className={HORIZONTAL_GUIDE} style={{ top: y * effScale }} />
      ))}
    </div>
  )
}
