import { useMemo } from 'react'
import { BASE_GRID_TRACKS, resolveGridRect } from '@canshift/core'
import type { GridTracks } from '@canshift/core'

export interface GridGuidesProps {
  areaWidth: number
  areaHeight: number
  effScale: number
  tracks?: GridTracks
}

const VERTICAL_GUIDE = 'absolute bottom-0 top-0 w-px bg-[#FFFFFF0A]'

const HORIZONTAL_GUIDE = 'absolute left-0 right-0 h-px bg-[#FFFFFF0A]'

interface GuideLines {
  verticals: number[]
  horizontals: number[]
}

const guideLines = (width: number, height: number, tracks: GridTracks): GuideLines => {
  const area = { width, height }
  const cell = (col: number, row: number) =>
    resolveGridRect({ col, colSpan: 1, row, rowSpan: 1 }, area, tracks)
  const columns = Array.from({ length: tracks.columns }, (_, c) => cell(c, 0))
  const rows = Array.from({ length: tracks.rows }, (_, r) => cell(0, r))
  return {
    verticals: columns.flatMap((rect) => [rect.x, rect.x + rect.w]),
    horizontals: rows.flatMap((rect) => [rect.y, rect.y + rect.h]),
  }
}

export const GridGuides = ({
  areaWidth,
  areaHeight,
  effScale,
  tracks = BASE_GRID_TRACKS,
}: GridGuidesProps) => {
  const guides = useMemo(
    () => guideLines(areaWidth, areaHeight, tracks),
    [areaWidth, areaHeight, tracks]
  )

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
