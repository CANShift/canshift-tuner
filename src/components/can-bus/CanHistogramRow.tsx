import type { CSSProperties } from 'react'
import { forwardRef, memo } from 'react'
import { CanByteHistogram } from './CanByteHistogram'
import type { CanFrameStats } from '../../hooks/useCanScanner'

export interface CanHistogramRowProps {
  frame: CanFrameStats
  colSpan: number
  dataIndex: number
}

export const CanHistogramRow = memo(
  forwardRef<HTMLTableRowElement, CanHistogramRowProps>(({ frame, colSpan, dataIndex }, ref) => (
    <tr ref={ref} data-index={dataIndex}>
      <td colSpan={colSpan} style={expandedCellStyle}>
        <CanByteHistogram frame={frame} />
      </td>
    </tr>
  ))
)
CanHistogramRow.displayName = 'CanHistogramRow'

const expandedCellStyle: CSSProperties = {
  padding: '0 0 0 20px',
  borderBottom: '1px solid hsl(var(--brand-neutral-300))',
}
