import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { LAYOUT_GRID, resolveGridRect } from '@canshift/core'

export interface GridGuidesProps {
  areaWidth: number
  areaHeight: number
  effScale: number
}

const GUIDE_COLOR = '#FFFFFF0A'

const verticalGuideStyle = (x: number): CSSProperties => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: x,
  width: 1,
  background: GUIDE_COLOR,
})

const horizontalGuideStyle = (y: number): CSSProperties => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: y,
  height: 1,
  background: GUIDE_COLOR,
})

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
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {guides.verticals.map((x, i) => (
        <div key={`v${String(i)}`} style={verticalGuideStyle(x * effScale)} />
      ))}
      {guides.horizontals.map((y, i) => (
        <div key={`h${String(i)}`} style={horizontalGuideStyle(y * effScale)} />
      ))}
    </div>
  )
}
