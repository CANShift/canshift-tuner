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
      <td colSpan={colSpan} className="border-b border-brand-neutral-300 pl-5">
        <CanByteHistogram frame={frame} />
      </td>
    </tr>
  ))
)
CanHistogramRow.displayName = 'CanHistogramRow'
