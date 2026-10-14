import { useCallback, useMemo, useRef, useState, type RefObject } from 'react'
import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual'
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

type TableLayout = 'plain' | 'learn'

const LAYOUTS: Record<TableLayout, { colCount: number; widths: readonly (string | null)[] }> = {
  plain: { colCount: 6, widths: COLUMN_WIDTHS },
  learn: { colCount: 7, widths: COLUMN_WIDTHS_LEARN },
}

type RowVirtualizer = Virtualizer<HTMLDivElement, Element>

const visualRowKey = (row: VisualRow): string =>
  `${row.kind === 'main' ? 'm' : 'h'}${String(row.frame.id)}`

const visualRowsOf = (
  frames: readonly CanFrameStats[],
  expanded: ReadonlySet<number>
): VisualRow[] =>
  frames.flatMap((frame): VisualRow[] =>
    expanded.has(frame.id)
      ? [
          { kind: 'main', frame },
          { kind: 'histogram', frame },
        ]
      : [{ kind: 'main', frame }]
  )

const useExpandedIds = () => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<number>>(() => new Set())
  const toggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }, [])
  return { expandedIds, toggle }
}

const useRowVirtualizer = (
  rows: VisualRow[],
  scrollRef: RefObject<HTMLDivElement | null>
): RowVirtualizer =>
  useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    getItemKey: (index) => visualRowKey(rows[index] as VisualRow),
  })

const paddingOf = (virtualizer: RowVirtualizer) => {
  const items = virtualizer.getVirtualItems()
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) return { top: 0, bottom: 0 }
  return { top: first.start, bottom: virtualizer.getTotalSize() - last.end }
}

const EmptyTable = () => (
  <div className="px-6 py-16 text-center text-[13px] text-brand-neutral-500">
    No frames captured yet. Start the scan and wait for the bus to send something.
  </div>
)

const TableHead = ({
  learning,
  widths,
}: {
  learning: boolean
  widths: readonly (string | null)[]
}) => (
  <>
    <colgroup>
      {widths.map((widthClass, i) => (
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
        {learning && <th className={TABLE_HEAD_CELL}>CHANGES</th>}
        <th className={TABLE_HEAD_CELL}>MAPPED TO</th>
      </tr>
    </thead>
  </>
)

const SpacerRow = ({ height, colCount }: { height: number; colCount: number }) =>
  height > 0 ? (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <tr aria-hidden style={{ height }}>
      <td colSpan={colCount} className="border-0 p-0" />
    </tr>
  ) : null

interface RowContext extends Omit<CanFrameTableProps, 'frames'> {
  colCount: number
  expandedIds: ReadonlySet<number>
  toggle: (id: number) => void
  measure: RowVirtualizer['measureElement']
}

const VirtualRow = ({ row, index, ctx }: { row: VisualRow; index: number; ctx: RowContext }) =>
  row.kind === 'histogram' ? (
    <CanHistogramRow ref={ctx.measure} dataIndex={index} frame={row.frame} colSpan={ctx.colCount} />
  ) : (
    <CanFrameRow
      ref={ctx.measure}
      dataIndex={index}
      frame={row.frame}
      mappedName={ctx.mappedTo.get(row.frame.id) ?? null}
      learnScore={ctx.learnScores === null ? null : (ctx.learnScores.get(row.frame.id) ?? 0)}
      expanded={ctx.expandedIds.has(row.frame.id)}
      onToggle={ctx.toggle}
      onPromote={ctx.onPromote}
    />
  )

const FrameRows = ({
  rows,
  virtualizer,
  ctx,
}: {
  rows: VisualRow[]
  virtualizer: RowVirtualizer
  ctx: RowContext
}) => {
  const padding = paddingOf(virtualizer)
  return (
    <tbody>
      <SpacerRow height={padding.top} colCount={ctx.colCount} />
      {virtualizer.getVirtualItems().map((item) => (
        <VirtualRow
          key={item.key}
          row={rows[item.index] as VisualRow}
          index={item.index}
          ctx={ctx}
        />
      ))}
      <SpacerRow height={padding.bottom} colCount={ctx.colCount} />
    </tbody>
  )
}

export const CanFrameTable = ({ frames, ...props }: CanFrameTableProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { expandedIds, toggle } = useExpandedIds()
  const rows = useMemo(() => visualRowsOf(frames, expandedIds), [frames, expandedIds])
  const virtualizer = useRowVirtualizer(rows, scrollRef)
  const layout = LAYOUTS[props.learnScores === null ? 'plain' : 'learn']
  if (frames.length === 0) return <EmptyTable />
  const ctx: RowContext = {
    ...props,
    colCount: layout.colCount,
    expandedIds,
    toggle,
    measure: virtualizer.measureElement,
  }
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <table className={TABLE_SHELL}>
        <TableHead learning={props.learnScores !== null} widths={layout.widths} />
        <FrameRows rows={rows} virtualizer={virtualizer} ctx={ctx} />
      </table>
    </div>
  )
}
