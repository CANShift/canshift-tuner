import type { CSSProperties } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CanFrameRow } from './CanFrameRow'
import { CanHistogramRow } from './CanHistogramRow'
import type { CanFrameStats } from '../../hooks/useCanScanner'

export interface CanFrameTableProps {
  frames: readonly CanFrameStats[]
  mappedTo: ReadonlyMap<number, string>
  learnScores: ReadonlyMap<number, number> | null
  onPromote: (id: number) => void
}

type VisualRow =
  { kind: 'main'; frame: CanFrameStats } | { kind: 'histogram'; frame: CanFrameStats }

const COLUMN_WIDTHS = [110, 70, null, 100, 110, 180] as const
const COLUMN_WIDTHS_LEARN = [110, 70, null, 100, 110, 100, 180] as const
const ESTIMATED_ROW_HEIGHT = 45
const OVERSCAN_ROWS = 16

const visualRowKey = (row: VisualRow): string =>
  `${row.kind === 'main' ? 'm' : 'h'}${String(row.frame.id)}`

export const CanFrameTable = ({ frames, mappedTo, learnScores, onPromote }: CanFrameTableProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<number>>(() => new Set())

  const toggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const visualRows = useMemo<VisualRow[]>(() => {
    const rows: VisualRow[] = []
    for (const frame of frames) {
      rows.push({ kind: 'main', frame })
      if (expandedIds.has(frame.id)) rows.push({ kind: 'histogram', frame })
    }
    return rows
  }, [frames, expandedIds])

  const virtualizer = useVirtualizer({
    count: visualRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    getItemKey: (index) => visualRowKey(visualRows[index] as VisualRow),
  })

  const colCount = learnScores !== null ? 7 : 6
  const columnWidths = learnScores !== null ? COLUMN_WIDTHS_LEARN : COLUMN_WIDTHS
  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
      : 0

  if (frames.length === 0) {
    return (
      <div style={emptyStyle}>
        No frames captured yet. Start the scan and wait for the bus to send something.
      </div>
    )
  }

  return (
    <div ref={scrollRef} style={wrapperStyle}>
      <table style={tableStyle}>
        <colgroup>
          {columnWidths.map((width, i) => (
            <col key={i} style={width === null ? undefined : { width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th style={thFirstStyle}>ID</th>
            <th style={thStyle}>DLC</th>
            <th style={thStyle}>DATA</th>
            <th style={thStyle}>RATE</th>
            <th style={thStyle}>COUNT</th>
            {learnScores !== null && <th style={thStyle}>CHANGES</th>}
            <th style={thStyle}>MAPPED TO</th>
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr aria-hidden style={{ height: paddingTop }}>
              <td colSpan={colCount} style={spacerCellStyle} />
            </tr>
          )}
          {virtualItems.map((item) => {
            const row = visualRows[item.index] as VisualRow
            if (row.kind === 'histogram') {
              return (
                <CanHistogramRow
                  key={item.key}
                  ref={virtualizer.measureElement}
                  dataIndex={item.index}
                  frame={row.frame}
                  colSpan={colCount}
                />
              )
            }
            return (
              <CanFrameRow
                key={item.key}
                ref={virtualizer.measureElement}
                dataIndex={item.index}
                frame={row.frame}
                mappedName={mappedTo.get(row.frame.id) ?? null}
                learnScore={learnScores === null ? null : (learnScores.get(row.frame.id) ?? 0)}
                expanded={expandedIds.has(row.frame.id)}
                onToggle={toggle}
                onPromote={onPromote}
              />
            )
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden style={{ height: paddingBottom }}>
              <td colSpan={colCount} style={spacerCellStyle} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const wrapperStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  tableLayout: 'fixed',
}

const thStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: 'hsl(var(--brand-chrome-bg))',
  padding: '11px 20px 11px 0',
  borderBottom: '2px solid var(--brand-divider)',
  textAlign: 'left',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.18em',
  color: 'hsl(var(--brand-neutral-600))',
}

const thFirstStyle: CSSProperties = {
  ...thStyle,
  paddingLeft: 20,
}

const spacerCellStyle: CSSProperties = {
  padding: 0,
  border: 0,
}

const emptyStyle: CSSProperties = {
  padding: '64px 24px',
  textAlign: 'center',
  fontSize: 13,
  color: 'hsl(var(--brand-neutral-500))',
}
