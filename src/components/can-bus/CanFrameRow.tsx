import type { CSSProperties } from 'react'
import { forwardRef, memo, useEffect, useState } from 'react'
import type { CanFrameStats } from '../../hooks/useCanScanner'
import { MONO_FONT } from '../../lib/typography'
import { formatFrameIdHex } from '../../utils/frame-id'

export interface CanFrameRowProps {
  frame: CanFrameStats
  mappedName: string | null
  learnScore: number | null
  expanded: boolean
  dataIndex: number
  onToggle: (id: number) => void
  onPromote: (id: number) => void
}

const STALE_AFTER_MS = 2_000

const isStale = (lastSeenMs: number): boolean => performance.now() - lastSeenMs > STALE_AFTER_MS

export const CanFrameRow = memo(
  forwardRef<HTMLTableRowElement, CanFrameRowProps>(
    ({ frame, mappedName, learnScore, expanded, dataIndex, onToggle, onPromote }, ref) => {
      const [stale, setStale] = useState(() => isStale(frame.lastSeenMs))
      const idHex = formatFrameIdHex(frame.id)

      useEffect(() => {
        const remaining = STALE_AFTER_MS - (performance.now() - frame.lastSeenMs)
        if (remaining <= 0) {
          setStale(true)
          return
        }
        setStale(false)
        const timer = window.setTimeout(() => {
          setStale(true)
        }, remaining)
        return () => {
          window.clearTimeout(timer)
        }
      }, [frame.lastSeenMs])

      return (
        <tr ref={ref} data-index={dataIndex} style={rowStyle(stale)}>
          <td style={idCellStyle}>
            <button
              type="button"
              onClick={() => {
                onToggle(frame.id)
              }}
              style={expandButtonStyle}
              aria-label={expanded ? 'Collapse byte histogram' : 'Expand byte histogram'}
            >
              <span style={{ display: 'inline-block', width: 10 }}>{expanded ? '▾' : '▸'}</span>
              {idHex}
            </button>
          </td>
          <td style={dlcCellStyle}>{String(frame.lastDlc)}</td>
          <td style={dataCellStyle}>{formatPayload(frame.lastPayload, frame.lastDlc)}</td>
          <td style={dimCellStyle}>{String(frame.rateHz)} Hz</td>
          <td style={dimCellStyle}>{formatCount(frame.count)}</td>
          {learnScore !== null && <td style={dimCellStyle}>{formatCount(learnScore)}</td>}
          <td style={mappedCellStyle}>
            {mappedName ?? (
              <button
                type="button"
                className="editor-ghost-accent"
                onClick={() => {
                  onPromote(frame.id)
                }}
                style={promoteButtonStyle}
              >
                PROMOTE
              </button>
            )}
          </td>
        </tr>
      )
    }
  )
)
CanFrameRow.displayName = 'CanFrameRow'

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const formatPayload = (bytes: readonly number[], dlc: number): string => {
  const slice = bytes.slice(0, dlc)
  return slice.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

const rowStyle = (stale: boolean): CSSProperties => ({
  background: 'transparent',
  opacity: stale ? 0.55 : 1,
  transition: 'opacity 200ms linear',
})

const cellStyle: CSSProperties = {
  padding: '12px 20px 12px 0',
  borderBottom: '1px solid hsl(var(--brand-neutral-300))',
  fontFamily: MONO_FONT,
  fontSize: 13,
  color: 'hsl(var(--brand-text))',
  verticalAlign: 'middle',
  fontVariantNumeric: 'tabular-nums',
}

const idCellStyle: CSSProperties = {
  ...cellStyle,
  paddingLeft: 20,
  color: 'hsl(var(--brand-accent))',
}

const dlcCellStyle: CSSProperties = {
  ...cellStyle,
  color: 'hsl(var(--brand-neutral-600))',
}

const dataCellStyle: CSSProperties = {
  ...cellStyle,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const dimCellStyle: CSSProperties = {
  ...cellStyle,
  color: 'hsl(var(--brand-neutral-700))',
}

const mappedCellStyle: CSSProperties = {
  ...cellStyle,
  fontFamily: 'var(--font-ui)',
  fontSize: 12,
}

const promoteButtonStyle: CSSProperties = {
  padding: '3px 10px',
  background: 'none',
  border: '1px solid hsl(var(--brand-accent))',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.08em',
  color: 'hsl(var(--brand-accent))',
  cursor: 'pointer',
}

const expandButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}
