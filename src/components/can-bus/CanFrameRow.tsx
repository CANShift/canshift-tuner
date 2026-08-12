import { forwardRef, memo, useEffect, useState } from 'react'
import { cva } from 'class-variance-authority'
import type { CanFrameStats } from '../../hooks/useCanScanner'
import { cn } from '@/lib/utils'
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
        <tr
          ref={ref}
          data-index={dataIndex}
          className={cn(
            'bg-transparent [transition:opacity_200ms_linear]',
            stale ? 'opacity-55' : 'opacity-100'
          )}
        >
          <td className={cn(cell({ tone: 'id' }))}>
            <button
              type="button"
              onClick={() => {
                onToggle(frame.id)
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-inherit [font:inherit]"
              aria-label={expanded ? 'Collapse byte histogram' : 'Expand byte histogram'}
            >
              <span className="inline-block w-2.5">{expanded ? '▾' : '▸'}</span>
              {idHex}
            </button>
          </td>
          <td className={cn(cell({ tone: 'dlc' }))}>{String(frame.lastDlc)}</td>
          <td className={cn(cell({ tone: 'data' }))}>
            {formatPayload(frame.lastPayload, frame.lastDlc)}
          </td>
          <td className={cn(cell({ tone: 'dim' }))}>{String(frame.rateHz)} Hz</td>
          <td className={cn(cell({ tone: 'dim' }))}>{formatCount(frame.count)}</td>
          {learnScore !== null && (
            <td className={cn(cell({ tone: 'dim' }))}>{formatCount(learnScore)}</td>
          )}
          <td className={cn(cell({ tone: 'mapped' }))}>
            {mappedName ?? (
              <button
                type="button"
                className="editor-ghost-accent cursor-pointer border border-brand-accent bg-transparent px-2.5 py-[3px] text-[10px] font-extrabold tracking-[0.08em] text-brand-accent"
                onClick={() => {
                  onPromote(frame.id)
                }}
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

const cell = cva(
  'border-b border-brand-neutral-300 py-3 pl-0 pr-5 align-middle font-mono text-[13px] tabular-nums text-brand-text',
  {
    variants: {
      tone: {
        id: 'pl-5 text-brand-accent',
        dlc: 'text-brand-neutral-600',
        data: 'overflow-hidden text-ellipsis whitespace-nowrap',
        dim: 'text-brand-neutral-700',
        mapped: 'font-sans text-[12px]',
      },
    },
  }
)
