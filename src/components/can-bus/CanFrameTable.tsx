import { useCallback, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CanFrameRow } from './CanFrameRow'
import { CanHistogramRow } from './CanHistogramRow'
import type { CanFrameStats } from '../../hooks/useCanScanner'
import { cn } from '@/lib/utils'
import { TABLE_HEAD_CELL, TABLE_SHELL } from '../ui/table'

export interface CanFrameTableProps {
  frames: readonly CanFrameStats[]
  mappedTo: ReadonlyMap<number, string>
  learnScores: ReadonlyMap<number, number> | null
  onPromote: (id: number) => void
}

type VisualRow =
  { kind: 'main'; frame: CanFrameStats } | { kind: 'histogram'; frame: CanFrameStats }

const COLUMN_WIDTHS = [
  'w-[110px]',
  'w-[70px]',
  null,
  'w-[100px]',
  'w-[110px]',
  'w-[180px]',
] as const
const COLUMN_WIDTHS_LEARN = [
  'w-[110px]',
  'w-[70px]',
  null,
  'w-[100px]',
  'w-[110px]',
  'w-[100px]',
  'w-[180px]',
] as const
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
      <div className="px-6 py-16 text-center text-[13px] text-brand-neutral-500">
        No frames captured yet. Start the scan and wait for the bus to send something.
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <table className={TABLE_SHELL}>
        <colgroup>
          {columnWidths.map((widthClass, i) => (
            <col key={i} className={widthClass ?? undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={cn(TABLE_HEAD_CELL, 'pl-5')}>ID</th>
            <th className={TABLE_HEAD_CELL}>DLC</th>
            <th className={TABLE_HEAD_CELL}>DATA</th>
            <th className={TABLE_HEAD_CELL}>RATE</th>
            <th className={TABLE_HEAD_CELL}>COUNT</th>
            {learnScores !== null && <th className={TABLE_HEAD_CELL}>CHANGES</th>}
            <th className={TABLE_HEAD_CELL}>MAPPED TO</th>
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            // eslint-disable-next-line no-inline-style/no-inline-style
            <tr aria-hidden style={{ height: paddingTop }}>
              <td colSpan={colCount} className="border-0 p-0" />
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
            // eslint-disable-next-line no-inline-style/no-inline-style
            <tr aria-hidden style={{ height: paddingBottom }}>
              <td colSpan={colCount} className="border-0 p-0" />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
